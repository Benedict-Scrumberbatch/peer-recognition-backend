drop user if exists "peer-recognition-test";
create user "peer-recognition-test" with password 'peer-recognition-test-password';

drop database if exists "peer-recognition-test";
create database "peer-recognition-test" owner "peer-recognition-test";

START TRANSACTION;
-- SELECT * FROM current_schema()
-- SELECT TRUE FROM information_schema.columns WHERE table_name = 'pg_class' and column_name = 'relispartition'
-- SELECT * FROM "information_schema"."tables" WHERE ("table_schema" = 'public' AND "table_name" = 'recognition') OR ("table_schema" = 'public' AND "table_name" = 'tagstats') OR ("table_schema" = 'public' AND "table_name" = 'tag') OR ("table_schema" = 'public' AND "table_name" = 'company') OR ("table_schema" = 'public' AND "table_name" = 'login') OR ("table_schema" = 'public' AND "table_name" = 'users') OR ("table_schema" = 'public' AND "table_name" = 'recognition_tags_tag')
--         SELECT columns.*,
--         pg_catalog.col_description(('"' || table_catalog || '"."' || table_schema || '"."' || table_name || '"')::regclass::oid, ordinal_position) AS description,
--         ('"' || "udt_schema" || '"."' || "udt_name" || '"')::"regtype" AS "regtype",
--         pg_catalog.format_type("col_attr"."atttypid", "col_attr"."atttypmod") AS "format_type"
--         FROM "information_schema"."columns"
--         LEFT JOIN "pg_catalog"."pg_attribute" AS "col_attr"
--         ON "col_attr"."attname" = "columns"."column_name"
--         AND "col_attr"."attrelid" = (
--           SELECT
--             "cls"."oid" FROM "pg_catalog"."pg_class" AS "cls"
--             LEFT JOIN "pg_catalog"."pg_namespace" AS "ns"
--             ON "ns"."oid" = "cls"."relnamespace"
--             WHERE "cls"."relname" = "columns"."table_name"
--             AND "ns"."nspname" = "columns"."table_schema"
--         )
--         WHERE
--         ("table_schema" = 'public' AND "table_name" = 'recognition') OR ("table_schema" = 'public' AND "table_name" = 'tagstats') OR ("table_schema" = 'public' AND "table_name" = 'tag') OR ("table_schema" = 'public' AND "table_name" = 'company') OR ("table_schema" = 'public' AND "table_name" = 'login') OR ("table_schema" = 'public' AND "table_name" = 'users') OR ("table_schema" = 'public' AND "table_name" = 'recognition_tags_tag')
-- SELECT "ns"."nspname" AS "table_schema", "t"."relname" AS "table_name", "cnst"."conname" AS "constraint_name", pg_get_constraintdef("cnst"."oid") AS "expression", CASE "cnst"."contype" WHEN 'p' THEN 'PRIMARY' WHEN 'u' THEN 'UNIQUE' WHEN 'c' THEN 'CHECK' WHEN 'x' THEN 'EXCLUDE' END AS "constraint_type", "a"."attname" AS "column_name" FROM "pg_constraint" "cnst" INNER JOIN "pg_class" "t" ON "t"."oid" = "cnst"."conrelid" INNER JOIN "pg_namespace" "ns" ON "ns"."oid" = "cnst"."connamespace" LEFT JOIN "pg_attribute" "a" ON "a"."attrelid" = "cnst"."conrelid" AND "a"."attnum" = ANY ("cnst"."conkey") WHERE "t"."relkind" IN ('r', 'p') AND (("ns"."nspname" = 'public' AND "t"."relname" = 'recognition') OR ("ns"."nspname" = 'public' AND "t"."relname" = 'tagstats') OR ("ns"."nspname" = 'public' AND "t"."relname" = 'tag') OR ("ns"."nspname" = 'public' AND "t"."relname" = 'company') OR ("ns"."nspname" = 'public' AND "t"."relname" = 'login') OR ("ns"."nspname" = 'public' AND "t"."relname" = 'users') OR ("ns"."nspname" = 'public' AND "t"."relname" = 'recognition_tags_tag'))
-- SELECT "ns"."nspname" AS "table_schema", "t"."relname" AS "table_name", "i"."relname" AS "constraint_name", "a"."attname" AS "column_name", CASE "ix"."indisunique" WHEN 't' THEN 'TRUE' ELSE'FALSE' END AS "is_unique", pg_get_expr("ix"."indpred", "ix"."indrelid") AS "condition", "types"."typname" AS "type_name" FROM "pg_class" "t" INNER JOIN "pg_index" "ix" ON "ix"."indrelid" = "t"."oid" INNER JOIN "pg_attribute" "a" ON "a"."attrelid" = "t"."oid"  AND "a"."attnum" = ANY ("ix"."indkey") INNER JOIN "pg_namespace" "ns" ON "ns"."oid" = "t"."relnamespace" INNER JOIN "pg_class" "i" ON "i"."oid" = "ix"."indexrelid" INNER JOIN "pg_type" "types" ON "types"."oid" = "a"."atttypid" LEFT JOIN "pg_constraint" "cnst" ON "cnst"."conname" = "i"."relname" WHERE "t"."relkind" IN ('r', 'p') AND "cnst"."contype" IS NULL AND (("ns"."nspname" = 'public' AND "t"."relname" = 'recognition') OR ("ns"."nspname" = 'public' AND "t"."relname" = 'tagstats') OR ("ns"."nspname" = 'public' AND "t"."relname" = 'tag') OR ("ns"."nspname" = 'public' AND "t"."relname" = 'company') OR ("ns"."nspname" = 'public' AND "t"."relname" = 'login') OR ("ns"."nspname" = 'public' AND "t"."relname" = 'users') OR ("ns"."nspname" = 'public' AND "t"."relname" = 'recognition_tags_tag'))
-- SELECT "con"."conname" AS "constraint_name", "con"."nspname" AS "table_schema", "con"."relname" AS "table_name", "att2"."attname" AS "column_name", "ns"."nspname" AS "referenced_table_schema", "cl"."relname" AS "referenced_table_name", "att"."attname" AS "referenced_column_name", "con"."confdeltype" AS "on_delete", "con"."confupdtype" AS "on_update", "con"."condeferrable" AS "deferrable", "con"."condeferred" AS "deferred" FROM ( SELECT UNNEST ("con1"."conkey") AS "parent", UNNEST ("con1"."confkey") AS "child", "con1"."confrelid", "con1"."conrelid", "con1"."conname", 
-- "con1"."contype", "ns"."nspname", "cl"."relname", "con1"."condeferrable", CASE WHEN "con1"."condeferred" THEN 'INITIALLY DEFERRED' ELSE 'INITIALLY IMMEDIATE' END as condeferred, CASE "con1"."confdeltype" WHEN 'a' THEN 'NO ACTION' WHEN 'r' THEN 'RESTRICT' WHEN 'c' THEN 'CASCADE' WHEN 'n' THEN 'SET NULL' WHEN 'd' THEN 'SET DEFAULT' END as "confdeltype", CASE "con1"."confupdtype" WHEN 'a' THEN 'NO ACTION' WHEN 'r' THEN 'RESTRICT' WHEN 'c' THEN 'CASCADE' WHEN 'n' 
-- THEN 'SET NULL' WHEN 'd' THEN 'SET DEFAULT' END as "confupdtype" FROM "pg_class" "cl" INNER JOIN "pg_namespace" "ns" ON "cl"."relnamespace" = "ns"."oid" INNER JOIN "pg_constraint" "con1" ON "con1"."conrelid" = "cl"."oid" WHERE "con1"."contype" = 'f' AND (("ns"."nspname" = 'public' AND "cl"."relname" = 'recognition') OR ("ns"."nspname" = 'public' 
-- AND "cl"."relname" = 'tagstats') OR ("ns"."nspname" = 'public' AND "cl"."relname" = 'tag') OR ("ns"."nspname" = 'public' AND "cl"."relname" = 'company') OR ("ns"."nspname" = 'public' AND "cl"."relname" = 'login') OR ("ns"."nspname" 
-- = 'public' AND "cl"."relname" = 'users') OR ("ns"."nspname" = 'public' AND "cl"."relname" = 'recognition_tags_tag')) ) "con" INNER JOIN "pg_attribute" "att" ON "att"."attrelid" = "con"."confrelid" AND "att"."attnum" = "con"."child" 
-- INNER JOIN "pg_class" "cl" ON "cl"."oid" = "con"."confrelid"  AND "cl"."relispartition" = 'f'INNER JOIN "pg_namespace" "ns" ON "cl"."relnamespace" = "ns"."oid" INNER JOIN "pg_attribute" "att2" ON "att2"."attrelid" = "con"."conrelid" AND "att2"."attnum" = "con"."parent"
-- SELECT * FROM "information_schema"."tables" WHERE "table_schema" = current_schema() AND "table_name" = 'typeorm_metadata'

CREATE TABLE "recognition" ("recId" SERIAL NOT NULL, "postDate" TIMESTAMP NOT NULL, "msg" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "companyCompanyId" integer, "empFromCompanyId" integer, "empFromEmployeeId" integer, "empToCompanyId" integer, "empToEmployeeId" integer, "deletedByCompanyId" integer, "deletedByEmployeeId" integer, CONSTRAINT "PK_8ccc0cf7c14593a549b72cb1143" PRIMARY KEY ("recId"))
;
CREATE INDEX "IDX_b8176517989db6bd7ca1a9d6ac" ON "recognition" ("companyCompanyId", "postDate") 
;
CREATE TABLE "tagstats" ("tagstatId" SERIAL NOT NULL, "countReceived" integer NOT NULL DEFAULT '0', "countSent" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "employeeCompanyId" integer, "employeeEmployeeId" integer, "tagTagId" integer, CONSTRAINT "PK_49a11dba3e876ede5a340be413e" PRIMARY KEY ("tagstatId"))
;
CREATE UNIQUE INDEX "IDX_f8d58576e10200980370f587c1" ON "tagstats" ("employeeCompanyId", "employeeEmployeeId", "tagTagId")
;
CREATE TABLE "tag" ("tagId" SERIAL NOT NULL, "value" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "companyCompanyId" integer, CONSTRAINT "PK_42bce6149e744e5cb7b11893348" PRIMARY KEY ("tagId"))
;
CREATE INDEX "IDX_2e1c46c843402e9d54bf87a825" ON "tag" ("companyCompanyId") 
;
CREATE TABLE "company" ("companyId" integer NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_81611e86d930483997273420166" PRIMARY KEY ("companyId"))
;
CREATE TABLE "login" ("email" character varying NOT NULL, "password" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "employeeCompanyId" integer, "employeeEmployeeId" integer, CONSTRAINT "REL_70941b5bce090acd4e1fb277c6" UNIQUE ("employeeCompanyId", "employeeEmployeeId"), CONSTRAINT "PK_a1fa377d7cba456bebaa6922edf" PRIMARY KEY ("email"))
;
SELECT "n"."nspname", "t"."typname" FROM "pg_type" "t" INNER JOIN "pg_namespace" "n" ON "n"."oid" = "t"."typnamespace" WHERE "n"."nspname" = current_schema() AND "t"."typname" = 'users_role_enum'
;
CREATE TYPE "users_role_enum" AS ENUM('employee', 'admin')
;
CREATE TABLE "users" ("companyId" integer NOT NULL, "employeeId" integer NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "positionTitle" character varying NOT NULL, "isManager" boolean NOT NULL, "role" "users_role_enum" NOT NULL DEFAULT 'employee', "startDate" TIMESTAMP NOT NULL, "numRecsReceived" integer NOT NULL DEFAULT '0', "numRecsSent" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "managerCompanyId" integer, "managerEmployeeId" integer, CONSTRAINT "PK_d617e90799f71d8806a635f8474" PRIMARY KEY ("companyId", "employeeId"))
;
CREATE UNIQUE INDEX "IDX_d617e90799f71d8806a635f847" ON "users" ("companyId", "employeeId") 
;
CREATE TABLE "recognition_tags_tag" ("recognitionRecId" integer NOT NULL, "tagTagId" integer NOT NULL, CONSTRAINT "PK_41cc9fafc10d70f275374ec7b8a" PRIMARY KEY ("recognitionRecId", "tagTagId"))
;
CREATE INDEX "IDX_81a322562307b67ef688487aa4" ON "recognition_tags_tag" ("recognitionRecId") 
;
CREATE INDEX "IDX_f5a005e98f2c7f5eae420740a5" ON "recognition_tags_tag" ("tagTagId") 
;
--creating a foreign keys: FK_0457082d5b2c1130ab694be3088, FK_724cd5eda4d3bd7efc8edd54eb5, FK_3782718edb61d76ad91cc193c5f, FK_e1f8890958da90cf98fb1cf704e on table "recognition"
ALTER TABLE "recognition" ADD CONSTRAINT "FK_0457082d5b2c1130ab694be3088" FOREIGN KEY ("companyCompanyId") REFERENCES "company"("companyId") ON DELETE NO ACTION ON UPDATE NO ACTION
;
ALTER TABLE "recognition" ADD CONSTRAINT "FK_724cd5eda4d3bd7efc8edd54eb5" FOREIGN KEY ("empFromCompanyId", "empFromEmployeeId") REFERENCES "users"("companyId","employeeId") ON DELETE NO ACTION ON UPDATE NO ACTION
;
ALTER TABLE "recognition" ADD CONSTRAINT "FK_3782718edb61d76ad91cc193c5f" FOREIGN KEY ("empToCompanyId", "empToEmployeeId") REFERENCES "users"("companyId","employeeId") ON DELETE NO ACTION ON UPDATE NO ACTION
;
ALTER TABLE "recognition" ADD CONSTRAINT "FK_e1f8890958da90cf98fb1cf704e" FOREIGN KEY ("deletedByCompanyId", 
"deletedByEmployeeId") REFERENCES "users"("companyId","employeeId") ON DELETE NO ACTION ON UPDATE NO ACTION
;
--creating a foreign keys: FK_1468d92d14b81928438f425de2d, FK_80f6a02c875e4d3d111cb6c847d on table "tagstats"
ALTER TABLE "tagstats" ADD CONSTRAINT "FK_1468d92d14b81928438f425de2d" FOREIGN KEY ("employeeCompanyId", "employeeEmployeeId") REFERENCES "users"("companyId","employeeId") ON DELETE NO ACTION ON UPDATE NO ACTION
;
ALTER TABLE "tagstats" ADD CONSTRAINT "FK_80f6a02c875e4d3d111cb6c847d" FOREIGN KEY ("tagTagId") REFERENCES "tag"("tagId") ON DELETE NO ACTION ON UPDATE NO ACTION
;
--creating a foreign keys: FK_2e1c46c843402e9d54bf87a825c on table "tag"
ALTER TABLE "tag" ADD CONSTRAINT "FK_2e1c46c843402e9d54bf87a825c" FOREIGN KEY ("companyCompanyId") REFERENCES "company"("companyId") ON DELETE NO ACTION ON UPDATE NO ACTION
;
--creating a foreign keys: FK_70941b5bce090acd4e1fb277c61 on table "login"
ALTER TABLE "login" ADD CONSTRAINT "FK_70941b5bce090acd4e1fb277c61" FOREIGN KEY ("employeeCompanyId", "employeeEmployeeId") REFERENCES "users"("companyId","employeeId") ON DELETE NO ACTION ON UPDATE NO ACTION
;
--creating a foreign keys: FK_6f9395c9037632a31107c8a9e58, FK_e4376d9cd9b008428f3d7c03e6b on table "users"
ALTER TABLE "users" ADD CONSTRAINT "FK_6f9395c9037632a31107c8a9e58" FOREIGN KEY ("companyId") REFERENCES "company"("companyId") ON DELETE NO ACTION ON UPDATE NO ACTION
;
ALTER TABLE "users" ADD CONSTRAINT "FK_e4376d9cd9b008428f3d7c03e6b" FOREIGN KEY ("managerCompanyId", "managerEmployeeId") REFERENCES "users"("companyId","employeeId") ON DELETE NO ACTION ON UPDATE NO ACTION
;
--creating a foreign keys: FK_81a322562307b67ef688487aa49, FK_f5a005e98f2c7f5eae420740a51 on table "recognition_tags_tag"
ALTER TABLE "recognition_tags_tag" ADD CONSTRAINT "FK_81a322562307b67ef688487aa49" FOREIGN KEY ("recognitionRecId") REFERENCES "recognition"("recId") ON DELETE CASCADE ON UPDATE NO ACTION
;
ALTER TABLE "recognition_tags_tag" ADD CONSTRAINT "FK_f5a005e98f2c7f5eae420740a51" FOREIGN KEY ("tagTagId") REFERENCES "tag"("tagId") ON DELETE CASCADE ON UPDATE NO ACTION
;

COMMIT;