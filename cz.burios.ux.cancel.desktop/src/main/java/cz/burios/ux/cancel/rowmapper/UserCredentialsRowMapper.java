package cz.burios.ux.cancel.rowmapper;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.jdbc.core.RowMapper;

import cz.burios.ux.cancel.model.UserCredentials;

public class UserCredentialsRowMapper implements RowMapper<UserCredentials> {

	@Override
	public UserCredentials mapRow(ResultSet rs, int rowNum) throws SQLException {
		UserCredentials user = new UserCredentials();
		user.setId(rs.getString("ID"));
		user.setUserId(rs.getString("USER_ID"));
		user.setUserName(rs.getString("USER_NAME"));
		user.setUserPassword(rs.getString("USER_PASSWORD"));
		user.setUserRole(rs.getString("USER_ROLE"));
		user.setEnabled(rs.getInt("ENABLED") == 1); 
		return user;
	}
	
}
