package cz.burios.ux.cancel.dao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import cz.burios.ux.cancel.rowmapper.UserDetailsRowMapper;
import cz.burios.ux.cancel.model.UserDetails;

@Repository
@Transactional
public class UserDetialsDao {

	@Autowired
	private JdbcTemplate jdbcTemplate;

	public UserDetails getUser(String username) {
		try {
			final String sql = "SELECT u.USER_NAME, u.USER_PASSWORD, u.ENABLED FROM user_credentials u WHERE u.USER_NAME = ?";
			UserDetails userDetails = jdbcTemplate.queryForObject(sql, new UserDetailsRowMapper(), username);
			return userDetails;
		} catch (EmptyResultDataAccessException ex) {
			// should have proper handling of Exception
			return null;
		}
	}
}
