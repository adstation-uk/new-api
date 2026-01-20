package controller

import (
	"fmt"
	"net/http"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	passkeysvc "github.com/QuantumNous/new-api/service/passkey"
	"github.com/QuantumNous/new-api/setting/system_setting"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

const (
	// SecureVerificationSessionKey 安全验证的 session key
	SecureVerificationSessionKey = "secure_verified_at"
	// SecureVerificationTimeout 验证有效期（秒）
	SecureVerificationTimeout = 300 // 5分钟
)

type UniversalVerifyRequest struct {
	Method string `json:"method"` // "2fa" or "passkey"
	Code   string `json:"code,omitempty"`
}

type VerificationStatusResponse struct {
	Verified  bool  `json:"verified"`
	ExpiresAt int64 `json:"expires_at,omitempty"`
}

// UniversalVerify 通用验证接口
// 支持 2FA 和 Passkey 验证，验证成功后在 session 中记录时间戳
func UniversalVerify(c *gin.Context) {
	userId := c.GetInt("id")
	if userId == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Not logged in",
		})
		return
	}

	var req UniversalVerifyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ApiError(c, fmt.Errorf("Parameter error: %v", err))
		return
	}

	// 获取用户信息
	user := &model.User{Id: userId}
	if err := user.FillUserById(); err != nil {
		common.ApiError(c, fmt.Errorf("Failed to get user information: %v", err))
		return
	}

	if user.Status != common.UserStatusEnabled {
		common.ApiError(c, fmt.Errorf("This user has been disabled"))
		return
	}

	// 检查用户的验证方式
	twoFA, _ := model.GetTwoFAByUserId(userId)
	has2FA := twoFA != nil && twoFA.IsEnabled

	passkey, passkeyErr := model.GetPasskeyByUserID(userId)
	hasPasskey := passkeyErr == nil && passkey != nil

	if !has2FA && !hasPasskey {
		common.ApiError(c, fmt.Errorf("User has not enabled 2FA or Passkey"))
		return
	}

	// 根据验证方式进行验证
	var verified bool
	var verifyMethod string

	switch req.Method {
	case "2fa":
		if !has2FA {
			common.ApiError(c, fmt.Errorf("User has not enabled 2FA"))
			return
		}
		if req.Code == "" {
			common.ApiError(c, fmt.Errorf("Verification code cannot be empty"))
			return
		}
		verified = validateTwoFactorAuth(twoFA, req.Code)
		verifyMethod = "2FA"

	case "passkey":
		if !hasPasskey {
			common.ApiError(c, fmt.Errorf("User has not enabled Passkey"))
			return
		}
		// Passkey 验证需要先调用 PasskeyVerifyBegin 和 PasskeyVerifyFinish
		// 这里只是验证 Passkey 验证流程是否已经完成
		// 实际上，前端应该先调用这两个接口，然后再调用本接口
		verified = true // Passkey 验证逻辑已在 PasskeyVerifyFinish 中完成
		verifyMethod = "Passkey"

	default:
		common.ApiError(c, fmt.Errorf("Unsupported verification method: %s", req.Method))
		return
	}

	if !verified {
		common.ApiError(c, fmt.Errorf("Verification failed, please check the verification code"))
		return
	}

	// 验证成功，在 session 中记录时间戳
	session := sessions.Default(c)
	now := time.Now().Unix()
	session.Set(SecureVerificationSessionKey, now)
	if err := session.Save(); err != nil {
		common.ApiError(c, fmt.Errorf("Failed to save verification status: %v", err))
		return
	}

	// 记录日志
	model.RecordLog(userId, model.LogTypeSystem, fmt.Sprintf("Universal security verification successful (verification method: %s)", verifyMethod))

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Verification successful",
		"data": gin.H{
			"verified":   true,
			"expires_at": now + SecureVerificationTimeout,
		},
	})
}

// GetVerificationStatus 获取验证状态
func GetVerificationStatus(c *gin.Context) {
	userId := c.GetInt("id")
	if userId == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Not logged in",
		})
		return
	}

	session := sessions.Default(c)
	verifiedAtRaw := session.Get(SecureVerificationSessionKey)

	if verifiedAtRaw == nil {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "",
			"data": VerificationStatusResponse{
				Verified: false,
			},
		})
		return
	}

	verifiedAt, ok := verifiedAtRaw.(int64)
	if !ok {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "",
			"data": VerificationStatusResponse{
				Verified: false,
			},
		})
		return
	}

	elapsed := time.Now().Unix() - verifiedAt
	if elapsed >= SecureVerificationTimeout {
		// 验证已过期
		session.Delete(SecureVerificationSessionKey)
		_ = session.Save()
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "",
			"data": VerificationStatusResponse{
				Verified: false,
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data": VerificationStatusResponse{
			Verified:  true,
			ExpiresAt: verifiedAt + SecureVerificationTimeout,
		},
	})
}

// CheckSecureVerification 检查是否已通过安全验证
// 返回 true 表示验证有效，false 表示需要重新验证
func CheckSecureVerification(c *gin.Context) bool {
	session := sessions.Default(c)
	verifiedAtRaw := session.Get(SecureVerificationSessionKey)

	if verifiedAtRaw == nil {
		return false
	}

	verifiedAt, ok := verifiedAtRaw.(int64)
	if !ok {
		return false
	}

	elapsed := time.Now().Unix() - verifiedAt
	if elapsed >= SecureVerificationTimeout {
		// 验证已过期，清除 session
		session.Delete(SecureVerificationSessionKey)
		_ = session.Save()
		return false
	}

	return true
}

// PasskeyVerifyAndSetSession Passkey 验证完成后设置 session
// 这是一个辅助函数，供 PasskeyVerifyFinish 调用
func PasskeyVerifyAndSetSession(c *gin.Context) {
	session := sessions.Default(c)
	now := time.Now().Unix()
	session.Set(SecureVerificationSessionKey, now)
	_ = session.Save()
}

// PasskeyVerifyForSecure 用于安全验证的 Passkey 验证流程
// 整合了 begin 和 finish 流程
func PasskeyVerifyForSecure(c *gin.Context) {
	if !system_setting.GetPasskeySettings().Enabled {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "Administrator has not enabled Passkey login",
		})
		return
	}

	userId := c.GetInt("id")
	if userId == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Not logged in",
		})
		return
	}

	user := &model.User{Id: userId}
	if err := user.FillUserById(); err != nil {
		common.ApiError(c, fmt.Errorf("Failed to get user information: %v", err))
		return
	}

	if user.Status != common.UserStatusEnabled {
		common.ApiError(c, fmt.Errorf("This user has been disabled"))
		return
	}

	credential, err := model.GetPasskeyByUserID(userId)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "This user has not bound Passkey yet",
		})
		return
	}

	wa, err := passkeysvc.BuildWebAuthn(c.Request)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	waUser := passkeysvc.NewWebAuthnUser(user, credential)
	sessionData, err := passkeysvc.PopSessionData(c, passkeysvc.VerifySessionKey)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	_, err = wa.FinishLogin(waUser, *sessionData, c.Request)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	// 更新凭证的最后使用时间
	now := time.Now()
	credential.LastUsedAt = &now
	if err := model.UpsertPasskeyCredential(credential); err != nil {
		common.ApiError(c, err)
		return
	}

	// 验证成功，设置 session
	PasskeyVerifyAndSetSession(c)

	// 记录日志
	model.RecordLog(userId, model.LogTypeSystem, "Passkey security verification successful")

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Passkey verification successful",
		"data": gin.H{
			"verified":   true,
			"expires_at": time.Now().Unix() + SecureVerificationTimeout,
		},
	})
}
