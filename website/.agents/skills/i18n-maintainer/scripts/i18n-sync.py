#!/usr/bin/env python3

import argparse
import json
from pathlib import Path


def load_json(file_path: str):
    try:
        return json.loads(Path(file_path).read_text(encoding='utf-8'))
    except json.JSONDecodeError as error:
        raise SystemExit(f'Invalid JSON in {file_path}: {error}')


def write_json(file_path: str, data):
    Path(file_path).write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + '\n',
        encoding='utf-8',
    )


def clone_value(value, mode: str):
    if isinstance(value, dict):
        return {k: clone_value(v, mode) for k, v in value.items()}
    if mode == 'copy':
        return value
    if mode == 'empty':
        return ''
    if mode == 'todo':
        return f'__TODO_TRANSLATE__ {value}' if isinstance(value, str) else value
    return value


def merge_missing(base_node, target_node, path, added, mode):
    if not isinstance(base_node, dict):
        return

    if not isinstance(target_node, dict):
        return

    for key, base_value in base_node.items():
        current_path = f'{path}.{key}' if path else key
        if key not in target_node:
            target_node[key] = clone_value(base_value, mode)
            added.append(current_path)
            continue

        target_value = target_node[key]
        if isinstance(base_value, dict) and isinstance(target_value, dict):
            merge_missing(base_value, target_value, current_path, added, mode)


def main():
    parser = argparse.ArgumentParser(
        description='Sync missing i18n keys from a source locale into target locale files.',
    )
    parser.add_argument('--base', help='Source locale file, e.g. locales/en.json')
    parser.add_argument('--source', help='Source locale file (alias of --base)')
    parser.add_argument('--targets', nargs='+', required=True, help='Target locale files to sync')
    parser.add_argument('--apply', action='store_true', help='Write changes to target files')
    parser.add_argument(
        '--missing-value-mode',
        choices=['copy', 'todo', 'empty'],
        default='copy',
        help='How to fill newly added leaf values',
    )
    args = parser.parse_args()

    source_file = args.source or args.base
    if not source_file:
        raise SystemExit('Either --source or --base is required.')

    base_data = load_json(source_file)
    if not isinstance(base_data, dict):
        raise SystemExit('Source locale must be a JSON object at root.')

    targets = list(dict.fromkeys(args.targets))
    targets = [file for file in targets if file != source_file]

    print('i18n sync result')
    print('================')
    print(f'source: {source_file}')
    print(f'targets: {", ".join(targets)}')
    print(f'mode: {args.missing_value_mode}')
    print(f'apply: {args.apply}')

    changed_targets = 0
    total_added = 0

    for target_file in targets:
        if not Path(target_file).exists():
            print(f'\n{target_file}')
            print('  skipped: file not found')
            continue

        target_data = load_json(target_file)
        if not isinstance(target_data, dict):
            print(f'\n{target_file}: skipped (root is not object)')
            continue

        added = []
        merge_missing(base_data, target_data, '', added, args.missing_value_mode)

        print(f'\n{target_file}')
        print(f'  missing_added: {len(added)}')
        if added:
            changed_targets += 1
            total_added += len(added)
            for key in added[:50]:
                print(f'  + {key}')
            if len(added) > 50:
                print(f'  ... and {len(added) - 50} more')
            if args.apply:
                write_json(target_file, target_data)
                print('  wrote: yes')
            else:
                print('  wrote: no (dry-run)')

    print('\nSummary')
    print('-------')
    print(f'changed_targets: {changed_targets}')
    print(f'total_added_keys: {total_added}')


if __name__ == '__main__':
    main()
