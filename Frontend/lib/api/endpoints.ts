export const API = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    WHOAMI: '/api/auth/whoami',
    UPDATEPROFILE: '/api/auth/update-profile',
  },
  ADMIN: {
    USER: {
      CREATE: '/api/admin/users/',        // POST
      GET_ALL: '/api/admin/users/',        // GET all users
      GET_BY_ID: (id: string) => `/api/admin/users/${id}`, // GET single user
      UPDATE: (id: string) => `/api/admin/users/${id}`,    // PUT or PATCH
      DELETE: (id: string) => `/api/admin/users/${id}`,    // DELETE
    }
  }
};
