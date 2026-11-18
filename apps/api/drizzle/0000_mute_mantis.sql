CREATE TABLE "phase0_integration_events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"trigger_source" text NOT NULL,
	"gemini_model" text NOT NULL,
	"gemini_result" jsonb NOT NULL,
	"status" text NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
