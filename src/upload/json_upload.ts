import { getManager } from 'typeorm';
import { Users } from '../entity/users.entity';

const entityManager = getManager();

function newUser(object): any {
	// Given a generic user object, make a new instance of users
}
