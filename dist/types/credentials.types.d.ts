interface SignupCredentials {
    username: string;
    email: string;
    password: string;
}
type LoginCredentials = Omit<SignupCredentials, "username">;
export { type LoginCredentials, type SignupCredentials };
//# sourceMappingURL=credentials.types.d.ts.map