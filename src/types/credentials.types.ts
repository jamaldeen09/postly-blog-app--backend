// ** All types here defines the structure of the data expected from the frontend ** \\


interface SignupCredentials {
    username: string;
    email: string;
    password: string;
}

type LoginCredentials = Omit<SignupCredentials, "username">;


export {
    type LoginCredentials,
    type SignupCredentials
}