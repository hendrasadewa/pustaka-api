import { UserEntity } from "../domains/users";
import { Env } from "./environments";

export type APIConfig = {
  Bindings: Env;
  Variables: {
    user?: UserEntity;
  };
};
