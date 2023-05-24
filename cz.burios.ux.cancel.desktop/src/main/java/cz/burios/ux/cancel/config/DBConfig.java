package cz.burios.ux.cancel.config;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.sql.DataSource;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
// import org.springframework.context.annotation.PropertySource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class DBConfig {

	private DataSource ds = null;
	
	public DBConfig() {
		System.out.println("DBConfig.JdbcConfig()");
	}
	
	@Bean(name = "dataSource")
	public DataSource dataSource() {
		System.out.println("DBConfig.dataSource( START )");
		try {
			if (ds == null) {
				Context initCtx = new InitialContext();
				Context envCtx = (Context) initCtx.lookup("java:comp/env");
				ds = (DataSource) envCtx.lookup("DBDataSource");
			}
			System.out.println("ds: " + ds);
		} catch (Exception e) {
			e.printStackTrace();
		}
		System.out.println("DBConfig.dataSource( END )");
		return ds;  
	}	

	@Bean(name = "jdbcTemplate")
	public JdbcTemplate getJdbcTemplate() throws ClassNotFoundException {
		JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource());
		return jdbcTemplate;
	}

	@Bean(name = "passwordEncoder")
	public BCryptPasswordEncoder getBCryptPasswordEncoder() {
		return new BCryptPasswordEncoder();
	}	
}