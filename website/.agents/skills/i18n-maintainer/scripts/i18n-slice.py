#!/usr/bin/env python3

import argparse
import json
from pathlib import Path


def load_json(file_path: str):
    try:
        return json.loads(Path(file_path).read_text(encoding='utf-8'))
    except json.JSONDecodeError as error:
        raise SystemExit(f'Invalid JSON in {file_path}: {error}')


def get_by_path(data, dotted_path: str):
    current = data
    if not dotted_path:
        return current
    for segment in dotted_path.split('.'):
        if not isinstance(current, dict) or segment not in current:
            raise KeyError(dotted_path)
        current = current[segment]
    return current


def count_leaf_keys(obj):
    if isinstance(obj, dict):
        return sum(count_leaf_keys(value) for value in obj.values())
    return 1


def main():
    parser = argparse.ArgumentParser(description='Print one i18n namespace subtree from locale JSON.')
    parser.add_argument('--file', required=True, help='Locale file path, e.g. locales/zh.json')
    parser.add_argument('--prefix', required=True, help='Namespace path, e.g. Page.Home')
    parser.add_argument('--compact', action='store_true', help='Print compact JSON without indentation')
    args = parser.parse_args()

    data = load_json(args.file)
    try:
        subtree = get_by_path(data, args.prefix)
    except KeyError:
        raise SystemExit(f'Namespace not found: {args.prefix}')

    print(f'file: {args.file}')
    print(f'prefix: {args.prefix}')
    print(f'leaf_keys: {count_leaf_keys(subtree)}')
    print('---')
    if args.compact:
        print(json.dumps(subtree, ensure_ascii=False, separators=(',', ':')))
    else:
        print(json.dumps(subtree, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
