package cz.burios.ux.cancel.config;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

@Configuration
@EnableWebSecurity
@EnableWebMvc
public class WebSecurityConfig {

	@Autowired private DataSource dataSource;
	@Autowired private BCryptPasswordEncoder passwordEncoder;
	
	@Autowired
	public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
		final String sqlUserName = "SELECT u.USER_NAME, u.USER_PASSWORD, u.ENABLED FROM user_credentials u WHERE u.USER_NAME = ?";
		final String sqlAuthorities = "SELECT u.USER_NAME, u.USER_ROLE FROM user_credentials u WHERE u.USER_NAME = ?";

		auth.jdbcAuthentication()
			.dataSource(dataSource)
			.usersByUsernameQuery(sqlUserName)
			.authoritiesByUsernameQuery(sqlAuthorities)
			.passwordEncoder(passwordEncoder);
	}
	
	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http.authorizeHttpRequests(auth -> auth
			//.requestMatchers("/home").permitAll()
			.requestMatchers("/p/**").authenticated()
				//.hasAnyRole("ROLE_USER", "ROLE_ADMIN", "ROLE_SUPERVISOR" )
			.anyRequest().permitAll()
		)
		.formLogin()
			.loginPage("/auth/login")
				.usernameParameter("userName")
				.passwordParameter("userPassword")
			.loginProcessingUrl("/j_spring_security_check")
			.defaultSuccessUrl("/p/desktop")
			.failureUrl("/auth/login?error")
	    ;		
		return http.build();
	}
}
