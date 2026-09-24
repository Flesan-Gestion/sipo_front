import { Utilities } from "../../../shared/classes/Utilities";
import { usersData } from "../data/users";
import { UserInterface } from "../interfaces/user.interface";

export class UserService {

    static async getUsers(): Promise<UserInterface[]> {
        const data: UserInterface[] = await UserService.simulateAsyncRequest();
        return data;
    }

    private static async simulateAsyncRequest(): Promise<any> {
        await Utilities.sleep(3000);
        return usersData;
    }

}