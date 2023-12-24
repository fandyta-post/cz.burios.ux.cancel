package cz.burios.ux.cancel.config;

import org.springframework.stereotype.Service;

import cz.burios.ux.core.config.AbstractApplicationDefineConfig;

@Service
@SuppressWarnings("serial")
public class ApplicationDefineConfig extends AbstractApplicationDefineConfig {

	@Override
	public void init() {
		// System.out.println("cancel.ApplicationInfoConfig.init()");
		path = "cancel";
		name = "Cancel";
		title = "Buriosca.cz - Cancel";
		
		options.put("autheticable", Boolean.TRUE);
		options.put("oauth2_autheticable", Boolean.TRUE);
	}	
}