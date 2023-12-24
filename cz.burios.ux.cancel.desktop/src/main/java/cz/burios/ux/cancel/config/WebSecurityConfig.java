package cz.burios.ux.cancel.config;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

@Configuration
@EnableWebSecurity
@ComponentScan("cz.burios.ux")
@PropertySource("classpath:application.properties")
public class WebSecurityConfig extends cz.burios.ux.security.oauth.config.WebSecurityConfig {

	public WebSecurityConfig() {
		super();
		System.out.println("cz.burios.ux.cancel.config.WebSecurityConfig()");
	}
	
	@Override
	public String[] getPermitPaths() {
		return new String[] { "/", "/auth/**" };
	}	
}