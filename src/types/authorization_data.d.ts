type AuthorizationData = {
  access_token: string;
  token_type: string;
  expires_in?: number;
  menu_permission?: MenuPermission[];
  permission?: Permission[];
}