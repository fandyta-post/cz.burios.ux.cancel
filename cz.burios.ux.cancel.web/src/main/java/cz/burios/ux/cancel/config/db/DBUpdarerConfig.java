package cz.burios.ux.cancel.config.db;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import cz.burios.ux.uniql.config.db.DBUpadaterAsbtract;

@Configuration
public class DBUpdarerConfig {
	
	@Bean(name="dbUpdater")
	public DBUpadaterAsbtract getUpdater() {
		return new DBUpdater();
	}
}
