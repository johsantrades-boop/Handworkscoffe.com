import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`menu_items\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_order\` text,
  	\`name\` text NOT NULL,
  	\`category_id\` integer NOT NULL,
  	\`description\` text,
  	\`seasonal\` integer DEFAULT false,
  	\`sold_out\` integer DEFAULT false,
  	\`hidden\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`category_id\`) REFERENCES \`menu_categories\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`menu_items__order_idx\` ON \`menu_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`menu_items_category_idx\` ON \`menu_items\` (\`category_id\`);`)
  await db.run(sql`CREATE INDEX \`menu_items_updated_at_idx\` ON \`menu_items\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`menu_items_created_at_idx\` ON \`menu_items\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`menu_categories\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_order\` text,
  	\`name\` text NOT NULL,
  	\`note\` text,
  	\`hidden\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`menu_categories__order_idx\` ON \`menu_categories\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`menu_categories_updated_at_idx\` ON \`menu_categories\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`menu_categories_created_at_idx\` ON \`menu_categories\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`events\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`kind\` text DEFAULT 'event',
  	\`start_date\` text,
  	\`end_date\` text,
  	\`time_label\` text,
  	\`image_id\` integer,
  	\`summary\` text,
  	\`link_label\` text,
  	\`link_url\` text,
  	\`archived\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`events_image_idx\` ON \`events\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`events_updated_at_idx\` ON \`events\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`events_created_at_idx\` ON \`events\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`events__status_idx\` ON \`events\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_events_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_kind\` text DEFAULT 'event',
  	\`version_start_date\` text,
  	\`version_end_date\` text,
  	\`version_time_label\` text,
  	\`version_image_id\` integer,
  	\`version_summary\` text,
  	\`version_link_label\` text,
  	\`version_link_url\` text,
  	\`version_archived\` integer DEFAULT false,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`events\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_events_v_parent_idx\` ON \`_events_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_events_v_version_version_image_idx\` ON \`_events_v\` (\`version_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_events_v_version_version_updated_at_idx\` ON \`_events_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_events_v_version_version_created_at_idx\` ON \`_events_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_events_v_version_version__status_idx\` ON \`_events_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_events_v_created_at_idx\` ON \`_events_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_events_v_updated_at_idx\` ON \`_events_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_events_v_latest_idx\` ON \`_events_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_events_v_autosave_idx\` ON \`_events_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`reviews\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_order\` text,
  	\`author\` text NOT NULL,
  	\`rating\` numeric DEFAULT 5 NOT NULL,
  	\`when\` text,
  	\`quote\` text NOT NULL,
  	\`source\` text DEFAULT 'google',
  	\`show\` integer DEFAULT true,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`reviews__order_idx\` ON \`reviews\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`reviews_updated_at_idx\` ON \`reviews\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`reviews_created_at_idx\` ON \`reviews\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`gallery\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_order\` text,
  	\`photo_id\` integer NOT NULL,
  	\`caption\` text NOT NULL,
  	\`hidden\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`gallery__order_idx\` ON \`gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`gallery_photo_idx\` ON \`gallery\` (\`photo_id\`);`)
  await db.run(sql`CREATE INDEX \`gallery_updated_at_idx\` ON \`gallery\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`gallery_created_at_idx\` ON \`gallery\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`alt\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric,
  	\`sizes_thumbnail_url\` text,
  	\`sizes_thumbnail_width\` numeric,
  	\`sizes_thumbnail_height\` numeric,
  	\`sizes_thumbnail_mime_type\` text,
  	\`sizes_thumbnail_filesize\` numeric,
  	\`sizes_thumbnail_filename\` text,
  	\`sizes_card_url\` text,
  	\`sizes_card_width\` numeric,
  	\`sizes_card_height\` numeric,
  	\`sizes_card_mime_type\` text,
  	\`sizes_card_filesize\` numeric,
  	\`sizes_card_filename\` text,
  	\`sizes_large_url\` text,
  	\`sizes_large_width\` numeric,
  	\`sizes_large_height\` numeric,
  	\`sizes_large_mime_type\` text,
  	\`sizes_large_filesize\` numeric,
  	\`sizes_large_filename\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_thumbnail_sizes_thumbnail_filename_idx\` ON \`media\` (\`sizes_thumbnail_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_card_sizes_card_filename_idx\` ON \`media\` (\`sizes_card_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_large_sizes_large_filename_idx\` ON \`media\` (\`sizes_large_filename\`);`)
  await db.run(sql`CREATE TABLE \`users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`reset_password_requested_at\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`menu_items_id\` integer,
  	\`menu_categories_id\` integer,
  	\`events_id\` integer,
  	\`reviews_id\` integer,
  	\`gallery_id\` integer,
  	\`media_id\` integer,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`menu_items_id\`) REFERENCES \`menu_items\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`menu_categories_id\`) REFERENCES \`menu_categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`events_id\`) REFERENCES \`events\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`reviews_id\`) REFERENCES \`reviews\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`gallery_id\`) REFERENCES \`gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_menu_items_id_idx\` ON \`payload_locked_documents_rels\` (\`menu_items_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_menu_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`menu_categories_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_events_id_idx\` ON \`payload_locked_documents_rels\` (\`events_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_reviews_id_idx\` ON \`payload_locked_documents_rels\` (\`reviews_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_gallery_id_idx\` ON \`payload_locked_documents_rels\` (\`gallery_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`business_info_hours\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`day\` text NOT NULL,
  	\`closed\` integer,
  	\`open\` text,
  	\`close\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`business_info\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`business_info_hours_order_idx\` ON \`business_info_hours\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`business_info_hours_parent_id_idx\` ON \`business_info_hours\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`business_info_special_hours\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`date\` text NOT NULL,
  	\`label\` text,
  	\`closed\` integer,
  	\`open\` text,
  	\`close\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`business_info\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`business_info_special_hours_order_idx\` ON \`business_info_special_hours\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`business_info_special_hours_parent_id_idx\` ON \`business_info_special_hours\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`business_info\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`tagline\` text,
  	\`description\` text,
  	\`street\` text NOT NULL,
  	\`city\` text NOT NULL,
  	\`province\` text NOT NULL,
  	\`postal_code\` text NOT NULL,
  	\`phone\` text,
  	\`email\` text,
  	\`map_query\` text,
  	\`seating_note\` text,
  	\`instagram\` text,
  	\`facebook\` text,
  	\`google_maps_url\` text,
  	\`google_rating\` numeric,
  	\`google_review_count\` numeric,
  	\`share_image_id\` integer,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`share_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`business_info_share_image_idx\` ON \`business_info\` (\`share_image_id\`);`)
  await db.run(sql`CREATE TABLE \`announcement\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`enabled\` integer DEFAULT false,
  	\`message\` text,
  	\`tone\` text DEFAULT 'warm',
  	\`link_label\` text,
  	\`link_url\` text,
  	\`hide_after\` text,
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`announcement__status_idx\` ON \`announcement\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_announcement_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_enabled\` integer DEFAULT false,
  	\`version_message\` text,
  	\`version_tone\` text DEFAULT 'warm',
  	\`version_link_label\` text,
  	\`version_link_url\` text,
  	\`version_hide_after\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer
  );
  `)
  await db.run(sql`CREATE INDEX \`_announcement_v_version_version__status_idx\` ON \`_announcement_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_announcement_v_created_at_idx\` ON \`_announcement_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_announcement_v_updated_at_idx\` ON \`_announcement_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_announcement_v_latest_idx\` ON \`_announcement_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_announcement_v_autosave_idx\` ON \`_announcement_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`story_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`story\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`story_paragraphs_order_idx\` ON \`story_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`story_paragraphs_parent_id_idx\` ON \`story_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`story_facts\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`value\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`story\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`story_facts_order_idx\` ON \`story_facts\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`story_facts_parent_id_idx\` ON \`story_facts\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`story\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`heading\` text,
  	\`signoff\` text,
  	\`photo_id\` integer,
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`story_photo_idx\` ON \`story\` (\`photo_id\`);`)
  await db.run(sql`CREATE INDEX \`story__status_idx\` ON \`story\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_story_v_version_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_story_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_story_v_version_paragraphs_order_idx\` ON \`_story_v_version_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_story_v_version_paragraphs_parent_id_idx\` ON \`_story_v_version_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_story_v_version_facts\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`value\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_story_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_story_v_version_facts_order_idx\` ON \`_story_v_version_facts\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_story_v_version_facts_parent_id_idx\` ON \`_story_v_version_facts\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_story_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_eyebrow\` text,
  	\`version_heading\` text,
  	\`version_signoff\` text,
  	\`version_photo_id\` integer,
  	\`version__status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`version_photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_story_v_version_version_photo_idx\` ON \`_story_v\` (\`version_photo_id\`);`)
  await db.run(sql`CREATE INDEX \`_story_v_version_version__status_idx\` ON \`_story_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_story_v_created_at_idx\` ON \`_story_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_story_v_updated_at_idx\` ON \`_story_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_story_v_latest_idx\` ON \`_story_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_story_v_autosave_idx\` ON \`_story_v\` (\`autosave\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`menu_items\`;`)
  await db.run(sql`DROP TABLE \`menu_categories\`;`)
  await db.run(sql`DROP TABLE \`events\`;`)
  await db.run(sql`DROP TABLE \`_events_v\`;`)
  await db.run(sql`DROP TABLE \`reviews\`;`)
  await db.run(sql`DROP TABLE \`gallery\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
  await db.run(sql`DROP TABLE \`business_info_hours\`;`)
  await db.run(sql`DROP TABLE \`business_info_special_hours\`;`)
  await db.run(sql`DROP TABLE \`business_info\`;`)
  await db.run(sql`DROP TABLE \`announcement\`;`)
  await db.run(sql`DROP TABLE \`_announcement_v\`;`)
  await db.run(sql`DROP TABLE \`story_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`story_facts\`;`)
  await db.run(sql`DROP TABLE \`story\`;`)
  await db.run(sql`DROP TABLE \`_story_v_version_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_story_v_version_facts\`;`)
  await db.run(sql`DROP TABLE \`_story_v\`;`)
}
