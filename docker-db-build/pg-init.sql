drop user if exists "peer-recognition-test";
create user "peer-recognition-test" with password 'peer-recognition-test-password';

drop database if exists "peer-recognition-test";
create database "peer-recognition-test" owner "peer-recognition-test";

create type notification_notificationtype_enum as enum ('Generic', 'Recognition', 'Comment', 'Rockstar', 'Report');

create type users_role_enum as enum ('employee', 'admin', 'server-admin');

create table if not exists company
(
	"companyId" integer not null
		constraint "PK_81611e86d930483997273420166"
			primary key,
	name varchar not null,
	"createdAt" timestamp default now() not null,
	"updatedAt" timestamp default now() not null,
	"deletedAt" timestamp
);

create table if not exists tag
(
	"tagId" serial not null
		constraint "PK_42bce6149e744e5cb7b11893348"
			primary key,
	value varchar not null,
	"createdAt" timestamp default now() not null,
	"updatedAt" timestamp default now() not null,
	"deletedAt" timestamp,
	"companyCompanyId" integer
		constraint "FK_2e1c46c843402e9d54bf87a825c"
			references company
);

create index if not exists "IDX_2e1c46c843402e9d54bf87a825"
	on tag ("companyCompanyId");

create table if not exists users
(
	"companyId" integer not null
		constraint "FK_6f9395c9037632a31107c8a9e58"
			references company,
	"employeeId" integer not null,
	"firstName" varchar not null,
	"lastName" varchar not null,
	"positionTitle" varchar not null,
	"isManager" boolean not null,
	role users_role_enum default 'employee'::users_role_enum not null,
	"startDate" timestamp not null,
	"managerId" integer,
	"numRecsReceived" integer default 0 not null,
	"numRecsSent" integer default 0 not null,
	"createdAt" timestamp default now() not null,
	"updatedAt" timestamp default now() not null,
	"deletedAt" timestamp,
	constraint "PK_d617e90799f71d8806a635f8474"
		primary key ("companyId", "employeeId")
);

create table if not exists rockstar
(
	"rockstarID" serial not null
		constraint "PK_38e6048407c31d6d66a3d7d797a"
			primary key,
	month integer not null,
	year integer not null,
	"compID" integer not null,
	"rockstarCompanyId" integer,
	"rockstarEmployeeId" integer,
	constraint "FK_57aa48e8df95a284b4fded712a6"
		foreign key ("rockstarCompanyId", "rockstarEmployeeId") references users
);

create table if not exists rockstarstats
(
	"tagstatId" serial not null
		constraint "PK_2ab6a942d4e7bbad3bc5e58e425"
			primary key,
	"countReceived" integer default 0 not null,
	month integer not null,
	year integer not null,
	"rockstarID" integer not null,
	"createdAt" timestamp default now() not null,
	"updatedAt" timestamp default now() not null,
	"deletedAt" timestamp,
	"rockstarRockstarID" integer
		constraint "FK_930ab46903dedabb30e05f0e70c"
			references rockstar,
	"tagTagId" integer
		constraint "FK_043986eb3fb8c10425de9848356"
			references tag
);

create unique index if not exists "IDX_105836aeb6617ce6fa72228d42"
	on rockstarstats (month, year, "rockstarID", "tagTagId");

create unique index if not exists "IDX_1571be7048165f9b656b531839"
	on rockstar ("compID", month, year);

create table if not exists recognition
(
	"recId" serial not null
		constraint "PK_8ccc0cf7c14593a549b72cb1143"
			primary key,
	msg varchar not null,
	"createdAt" timestamp default now() not null,
	"updatedAt" timestamp default now() not null,
	"deletedAt" timestamp,
	"companyCompanyId" integer
		constraint "FK_0457082d5b2c1130ab694be3088"
			references company,
	"empFromCompanyId" integer,
	"empFromEmployeeId" integer,
	"empToCompanyId" integer,
	"empToEmployeeId" integer,
	"deletedByCompanyId" integer,
	"deletedByEmployeeId" integer,
	"rockstarRockstarID" integer
		constraint "FK_1e87e915cd3cd90051d52daeb7d"
			references rockstar,
	constraint "FK_724cd5eda4d3bd7efc8edd54eb5"
		foreign key ("empFromCompanyId", "empFromEmployeeId") references users,
	constraint "FK_3782718edb61d76ad91cc193c5f"
		foreign key ("empToCompanyId", "empToEmployeeId") references users,
	constraint "FK_e1f8890958da90cf98fb1cf704e"
		foreign key ("deletedByCompanyId", "deletedByEmployeeId") references users
);

create table if not exists comment
(
	"commentID" serial not null
		constraint "PK_4798c97b795daad7d4a88a007bf"
			primary key,
	msg varchar not null,
	"createdAt" timestamp default now() not null,
	"updatedAt" timestamp default now() not null,
	"deletedAt" timestamp,
	"employeeFromCompanyId" integer,
	"employeeFromEmployeeId" integer,
	"recognitionRecId" integer
		constraint "FK_1f829f35540fe2ef1f08debe93d"
			references recognition,
	"rockstarRockstarID" integer
		constraint "FK_4e88635a23e91943636fc5b9502"
			references rockstar,
	"deletedByCompanyId" integer,
	"deletedByEmployeeId" integer,
	constraint "FK_18cfbfee54192e0bd224277bb66"
		foreign key ("employeeFromCompanyId", "employeeFromEmployeeId") references users,
	constraint "FK_15ef3180758cbc80b9e6abd2e2c"
		foreign key ("deletedByCompanyId", "deletedByEmployeeId") references users
);

create table if not exists reaction
(
	"reactionID" serial not null
		constraint "PK_acc1e53e14ed74876c2ca0bf1f1"
			primary key,
	"createdAt" timestamp default now() not null,
	"updatedAt" timestamp default now() not null,
	"deletedAt" timestamp,
	"employeeFromCompanyId" integer,
	"employeeFromEmployeeId" integer,
	"recognitionRecId" integer
		constraint "FK_64c78531b7a5e1a796e3a27ab82"
			references recognition,
	"rockstarRockstarID" integer
		constraint "FK_2b79f84f1f0d28b0e9e1816dc83"
			references rockstar,
	"commentCommentID" integer
		constraint "FK_b82de18f3b945d38175258cd831"
			references comment,
	constraint "FK_a8cb1d886639731437ce906c4ee"
		foreign key ("employeeFromCompanyId", "employeeFromEmployeeId") references users
);

create unique index if not exists "IDX_8ae5947e86433b0ed19da31f93"
	on reaction ("employeeFromCompanyId", "employeeFromEmployeeId", "recognitionRecId");

create table if not exists report
(
	"reportID" serial not null
		constraint "PK_9591589e4fb7c70badb34e4efa3"
			primary key,
	msg varchar not null,
	"createdAt" timestamp default now() not null,
	"updatedAt" timestamp default now() not null,
	"deletedAt" timestamp,
	"employeeFromCompanyId" integer,
	"employeeFromEmployeeId" integer,
	"recognitionRecId" integer
		constraint "FK_9484012bc73171db437d86f5485"
			references recognition,
	"commentCommentID" integer
		constraint "FK_3b9dc9190022aeaf40847e28c79"
			references comment,
	constraint "FK_5eb3f71e1bba03b7fc9f9ed5869"
		foreign key ("employeeFromCompanyId", "employeeFromEmployeeId") references users
);

create table if not exists notification
(
	"notificationID" serial not null
		constraint "PK_c4ee9da23c9bd755be8044d80e5"
			primary key,
	"notificationType" notification_notificationtype_enum default 'Generic'::notification_notificationtype_enum not null,
	title varchar not null,
	msg varchar not null,
	"createdAt" timestamp default now() not null,
	"updatedAt" timestamp default now() not null,
	"deletedAt" timestamp,
	"employeeToCompanyId" integer,
	"employeeToEmployeeId" integer,
	"recognitionRecId" integer
		constraint "FK_3c1acb19a268249dc31353d29bd"
			references recognition,
	"reportReportID" integer
		constraint "FK_a8b54428f6358ed7d12f9586dc5"
			references report,
	"rockstarRockstarID" integer
		constraint "FK_66f61e066c12105b9540e8399ab"
			references rockstar,
	"commentCommentID" integer
		constraint "FK_173caad6106557b2772a04ef895"
			references comment,
	"reactionReactionID" integer
		constraint "FK_37668d413074c2da7c24d3a0514"
			references reaction,
	constraint "FK_a0d94d16edcd587be2afd099f30"
		foreign key ("employeeToCompanyId", "employeeToEmployeeId") references users
);

create unique index if not exists "IDX_cdea626480815fc3463e758ff9"
	on notification ("employeeToCompanyId", "employeeToEmployeeId", "createdAt");

create unique index if not exists "IDX_ce96eb2771ff0d2e77ba97d140"
	on report ("employeeFromCompanyId", "employeeFromEmployeeId", "recognitionRecId", "createdAt");

create index if not exists "IDX_65a1577c800c0e79923859cbad"
	on recognition ("empFromCompanyId", "empFromEmployeeId", "empToCompanyId", "empToEmployeeId", "createdAt");

create table if not exists tagstats
(
	"tagstatId" serial not null
		constraint "PK_49a11dba3e876ede5a340be413e"
			primary key,
	"countReceived" integer default 0 not null,
	"countSent" integer default 0 not null,
	"createdAt" timestamp default now() not null,
	"updatedAt" timestamp default now() not null,
	"deletedAt" timestamp,
	"employeeCompanyId" integer,
	"employeeEmployeeId" integer,
	"tagTagId" integer
		constraint "FK_80f6a02c875e4d3d111cb6c847d"
			references tag,
	constraint "FK_1468d92d14b81928438f425de2d"
		foreign key ("employeeCompanyId", "employeeEmployeeId") references users
);

create unique index if not exists "IDX_f8d58576e10200980370f587c1"
	on tagstats ("employeeCompanyId", "employeeEmployeeId", "tagTagId");

create table if not exists login
(
	email varchar not null
		constraint "PK_a1fa377d7cba456bebaa6922edf"
			primary key,
	password varchar not null,
	"createdAt" timestamp default now() not null,
	"updatedAt" timestamp default now() not null,
	"deletedAt" timestamp,
	"employeeCompanyId" integer,
	"employeeEmployeeId" integer,
	constraint "REL_70941b5bce090acd4e1fb277c6"
		unique ("employeeCompanyId", "employeeEmployeeId"),
	constraint "FK_70941b5bce090acd4e1fb277c61"
		foreign key ("employeeCompanyId", "employeeEmployeeId") references users
);

create unique index if not exists "IDX_d617e90799f71d8806a635f847"
	on users ("companyId", "employeeId");

create table if not exists recognition_tags_tag
(
	"recognitionRecId" integer not null
		constraint "FK_81a322562307b67ef688487aa49"
			references recognition
				on delete cascade,
	"tagTagId" integer not null
		constraint "FK_f5a005e98f2c7f5eae420740a51"
			references tag
				on delete cascade,
	constraint "PK_41cc9fafc10d70f275374ec7b8a"
		primary key ("recognitionRecId", "tagTagId")
);

create index if not exists "IDX_81a322562307b67ef688487aa4"
	on recognition_tags_tag ("recognitionRecId");

create index if not exists "IDX_f5a005e98f2c7f5eae420740a5"
	on recognition_tags_tag ("tagTagId");

