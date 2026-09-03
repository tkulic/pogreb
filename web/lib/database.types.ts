/**
 * Hand-written types for the schema in SPEC_database.md.
 *
 * Written by hand rather than generated: generation needs either the
 * `service_role` key or a linked CLI session against production, and the
 * schema is five tables that change through the spec first (SPEC.md ->
 * Ask first). If the schema changes, this file changes in the same pass.
 */

/** Croatian legal forms, kept as-is and dotless (SPEC.md -> Naming Convention). */
export type EntityType = 'doo' | 'jdoo' | 'obrt' | 'dd';

/** Which registry the record came from. */
export type DataSource = 'sudreg' | 'portor' | 'manual';

/**
 * Phone types drive frontend logic rather than being displayed verbatim --
 * the Croatian display words (`ured`, `mobitel`, `dezurni`) are a rendering
 * concern. After hours the office line is useless and `emergency` is the
 * entire value of the listing, which is why this is typed at all.
 */
export type PhoneType = 'office' | 'mobile' | 'emergency';

export type Phone = {
  number: string; // E.164, e.g. "+38521389890" -- usable directly in tel:
  type: PhoneType;
};

/**
 * One day of `working_hours`. Three forms, and a day that is **absent from
 * the object entirely** means unknown -- deliberately distinct from closed.
 * Wrongly telling a family a provider is closed is the worst failure the
 * detail page can produce, so `undefined` must never render as `zatvoreno`.
 */
export type WorkingHoursDay =
  | { from: string; to: string }
  | { closed: true }
  | { by_arrangement: true };

export type WeekDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type WorkingHours = Partial<Record<WeekDay, WorkingHoursDay>>;

export type City = {
  id: string;
  name: string;
  slug: string;
  county: string | null;
  created_at: string;
};

export type Entity = {
  id: string;
  name: string;
  /** Stored, never re-derived at query time (SPEC_database.md). */
  slug: string;
  oib: string;
  mbs: string | null;
  entity_type: EntityType;
  data_source: DataSource;
  /** Head office only -- never implies branch coverage. */
  address: string | null;
  city_id: string;
  postal_code: string | null;
  /** Ordered; the first entry is the primary number. */
  phones: Phone[] | null;
  email: string | null;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
  available_24_7: boolean;
  working_hours: WorkingHours | null;
  logo_url: string | null;
  owner_id: string | null;
  /** Internal, for data-quality triage. Never displayed (SPEC_frontend.md). */
  last_verified_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Service = {
  id: string;
  name: string;
  slug: string;
};

export type EntityService = {
  entity_id: string;
  service_id: string;
  price_from: number | null;
  price_to: number | null;
  note: string | null;
};

/** The four events `log_event` accepts. */
export type EventType =
  | 'detail_view'
  | 'phone_click'
  | 'website_click'
  | 'email_click';

/**
 * `events` has no SELECT policy -- the log is not readable through the API at
 * all (SPEC_database.md -> RLS). It appears here only as the shape of what
 * `log_event` writes; nothing in the app may attempt to read it.
 */
/**
 * `Insert` and `Update` are `never` on every table, and that is a statement of
 * intent backed by the database: no table has an INSERT, UPDATE or DELETE
 * policy, so `anon` cannot write through the API at all (SPEC_database.md →
 * RLS). Typing them as `never` means an attempted write fails to compile
 * rather than failing at runtime against production.
 *
 * The only write path in the product is the `log_event` function below.
 */
type ReadOnlyTable<Row> = {
  Row: Row;
  Insert: never;
  Update: never;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      cities: ReadOnlyTable<City>;
      entities: ReadOnlyTable<Entity>;
      services: ReadOnlyTable<Service>;
      entity_services: ReadOnlyTable<EntityService>;
    };
    Views: Record<never, never>;
    Functions: {
      log_event: {
        Args: { p_entity_id: string; p_event_type: EventType };
        Returns: undefined;
      };
    };
    Enums: {
      entity_type: EntityType;
      data_source: DataSource;
      event_type: EventType;
    };
    CompositeTypes: Record<never, never>;
  };
};
