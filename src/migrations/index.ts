import * as migration_20261031_225249_initial from './20261031_225249_initial';
import * as migration_20261101_035715_menu_needs_confirming from './20261101_035715_menu_needs_confirming';
import * as migration_20261101_204855_blob_storage_fields from './20261101_204855_blob_storage_fields';

export const migrations = [
  {
    up: migration_20261031_225249_initial.up,
    down: migration_20261031_225249_initial.down,
    name: '20261031_225249_initial',
  },
  {
    up: migration_20261101_035715_menu_needs_confirming.up,
    down: migration_20261101_035715_menu_needs_confirming.down,
    name: '20261101_035715_menu_needs_confirming',
  },
  {
    up: migration_20261101_204855_blob_storage_fields.up,
    down: migration_20261101_204855_blob_storage_fields.down,
    name: '20261101_204855_blob_storage_fields'
  },
];
