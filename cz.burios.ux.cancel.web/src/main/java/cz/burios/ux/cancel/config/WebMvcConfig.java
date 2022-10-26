package cz.burios.ux.cancel.config;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

@Configuration
@EnableWebMvc
@ComponentScan(basePackages = { "cz.burios.ux.core", "cz.burios.ux.desktop", "cz.burios.ux.cancel" })
public class WebMvcConfig extends cz.burios.ux.core.config.WebMvcConfig {

	public WebMvcConfig() {
		System.out.println("cz.burios.ux.cancel.config.WebMvcConfig()");
	}
	
}
