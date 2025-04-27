import { User } from "../schemas/user.schema";

export class UserResponseDto {
    id: string;

    firstName: string;

    lastName: string;

    email: string;

    gender: string;
     
    phone: string;

    constructor(data: User) {
        this.id = data._id.toString();
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.email = data.email;
        this.gender = data.gender;
        this.phone = data.phone;
    }
}