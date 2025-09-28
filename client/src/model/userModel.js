class UserModel {
    constructor(user) {
      this.nombre = user.nombre || '';
      this.email = user.email || '';
      this.nro_documento = user.nro_documento || '';
      this.password = user.password || '';
    }
  }
  export default UserModel;