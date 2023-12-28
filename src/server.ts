function login(username: string): string {
    const user = { name: "Harshit" };
    user.name = "something";
    return user.name + username;
}

login("Harshit");
