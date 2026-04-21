package controller

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/QuantumNous/new-api/types"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"
)

func newRetryTestContext() *gin.Context {
	gin.SetMode(gin.TestMode)
	recorder := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(recorder)
	ctx.Request = httptest.NewRequest(http.MethodPost, "/v1/chat/completions", nil)
	return ctx
}

func TestShouldRetry(t *testing.T) {
	t.Run("retry on 400 upstream error", func(t *testing.T) {
		ctx := newRetryTestContext()
		err := types.NewOpenAIError(errors.New("upstream malformed request"), types.ErrorCode("400"), http.StatusBadRequest)

		require.True(t, shouldRetry(ctx, err, 1))
	})

	t.Run("retry on empty response", func(t *testing.T) {
		ctx := newRetryTestContext()
		err := types.NewOpenAIError(errors.New("empty response from upstream"), types.ErrorCodeEmptyResponse, http.StatusInternalServerError)

		require.True(t, shouldRetry(ctx, err, 1))
	})

	t.Run("do not retry bad response body", func(t *testing.T) {
		ctx := newRetryTestContext()
		err := types.NewOpenAIError(errors.New("bad response body"), types.ErrorCodeBadResponseBody, http.StatusInternalServerError)

		require.False(t, shouldRetry(ctx, err, 1))
	})

	t.Run("do not retry prompt blocked", func(t *testing.T) {
		ctx := newRetryTestContext()
		err := types.NewOpenAIError(errors.New("prompt blocked"), types.ErrorCodePromptBlocked, http.StatusBadRequest)

		require.False(t, shouldRetry(ctx, err, 1))
	})

	t.Run("do not retry when retries exhausted", func(t *testing.T) {
		ctx := newRetryTestContext()
		err := types.NewOpenAIError(errors.New("upstream malformed request"), types.ErrorCode("400"), http.StatusBadRequest)

		require.False(t, shouldRetry(ctx, err, 0))
	})
}
