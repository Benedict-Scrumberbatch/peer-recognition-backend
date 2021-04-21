drop user if exists "peer-recognition-test";
create user "peer-recognition-test" with password 'peer-recognition-test-password';

drop database if exists "peer-recognition-test";
create database "peer-recognition-test" owner "peer-recognition-test";
