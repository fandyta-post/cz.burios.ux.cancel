package cz.burios.ux.cancel.dao;

import java.sql.Connection;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import cz.burios.ux.cancel.rowmapper.UserCredentialsRowMapper;
import cz.burios.ux.cancel.model.UserCredentials;

@Repository
@Transactional
public class UserCredentialsDao {

	@Autowired private JdbcTemplate jdbcTemplate;


	public UserCredentials getRecord(final String id) {
		// System.out.println("UserCredentialsDao.getRecord().jdbcTemplate: " + jdbcTemplate);
		UserCredentials record = jdbcTemplate.queryForObject(
			"SELECT * FROM user_credentials WHERE ID = ?"
			, new UserCredentialsRowMapper()
			, new Object[] { id }
		);
		return record;
	}

	public List<UserCredentials> getRecordByWhere(String where, Object... params) throws DataAccessException {
		String sql = "SELECT * FROM user_credentials WHERE " + where;
		List<UserCredentials> records = jdbcTemplate.query(sql, new UserCredentialsRowMapper(), params);
		return records;
	}
	
	public List<UserCredentials> getRecords() {
		List<UserCredentials> records = jdbcTemplate.query(
			"SELECT * FROM user_credentials", new UserCredentialsRowMapper()
		);
		return records;
	}

	public void addRecord(final UserCredentials record) {
		// System.out.println("UserCredentialsDao.addRecord().record: " + record);
		String sql = 
			"INSERT INTO user_credentials ("
				+ "ID, USER_ID, USER_NAME, USER_PASSWORD, USER_ROLE, ENABLED"
			+ ") VALUES ("
				+ "?, ?, ?, ?, ?, ?"
			+ ")";
		jdbcTemplate.update(sql,
			new Object[] { 
				record.getId(), 
				record.getUserId(),
				record.getUserName(),
				record.getUserPassword(),
				record.getUserRole(),
				"1"
			}
		);
	}

	public void updateRecord(final UserCredentials record) {
		jdbcTemplate.update(
			"UPDATE user_credentials SET "
			+ "USER_ID = ?, "
			+ "USER_NAME = ?, "
			+ "USER_PASSWORD = ?, "
			+ "USER_ROLE = ?, "
			+ "ENABLED = ? "
			+ "WHERE id = ?", 
			new Object[] { 
				record.getUserId(),
				record.getUserName(),
				record.getUserPassword(),
				record.getUserRole(),
				record.getEnabled() ? 1 : 0,
				record.getId()	
			}
		);
	}

	public void deleteRecord(final String id) {
		jdbcTemplate.update("DELETE FROM user_credentials WHERE id = ?", new Object[] { id });
	}

	public JdbcTemplate jdbcTemplate() {
		return jdbcTemplate;
	}
}
