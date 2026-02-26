#!/usr/bin/env python3

import argparse
import json
from pathlib import Path


def load_json(file_path: str):
    try:
        return json.loads(Path(file_path).read_text(encoding='utf-8'))
    except json.JSONDecodeError as error:
        raise SystemExit(f'Invalid JSON in {file_path}: {error}')


def flatten_keys(obj, prefix=''):
    keys = set()
    if isinstance(obj, dict):
        for key, value in obj.items():
            current = f'{prefix}.{key}' if prefix else key
            keys.add(current)
            keys |= flatten_keys(value, current)
    return keys


def main():
    parser = argparse.ArgumentParser(description='Compare i18n key parity between two locale JSON files.')
    parser.add_argument('--base', required=True, help='Base locale file, e.g. locales/en.json')
    parser.add_argument('--target', required=True, help='Target locale file, e.g. locales/zh.json')
    parser.add_argument('--prefix', default='', help='Optional namespace filter, e.g. Page.Home')
    args = parser.parse_args()

    base_data = load_json(args.base)
    target_data = load_json(args.target)

    base_keys = flatten_keys(base_data)
    target_keys = flatten_keys(target_data)

    if args.prefix:
        prefix = args.prefix
        base_keys = {k for k in base_keys if k == prefix or k.startswith(f'{prefix}.')}
        target_keys = {k for k in target_keys if k == prefix or k.startswith(f'{prefix}.')}

    missing_in_target = sorted(base_keys - target_keys)
    missing_in_base = sorted(target_keys - base_keys)

    print('i18n diff result')
    print('================')
    print(f'base: {args.base}')
    print(f'target: {args.target}')
    print(f'prefix: {args.prefix or "<all>"}')
    print(f'base_keys: {len(base_keys)}')
    print(f'target_keys: {len(target_keys)}')
    print(f'missing_in_target: {len(missing_in_target)}')
    print(f'missing_in_base: {len(missing_in_base)}')

    if missing_in_target:
        print('\n-- Missing in target --')
        for key in missing_in_target:
            print(key)

    if missing_in_base:
        print('\n-- Missing in base --')
        for key in missing_in_base:
            print(key)

    if not missing_in_target and not missing_in_base:
        print('\nOK: key sets are aligned.')


if __name__ == '__main__':
    main()
