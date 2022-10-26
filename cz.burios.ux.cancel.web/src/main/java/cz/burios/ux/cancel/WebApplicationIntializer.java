package cz.burios.ux.cancel;

import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.servlet.DispatcherServlet;
import org.springframework.web.servlet.FrameworkServlet;
import org.springframework.web.servlet.support.AbstractAnnotationConfigDispatcherServletInitializer;

import cz.burios.ux.cancel.config.ApplicationDefineConfig;
import cz.burios.ux.cancel.config.WebMvcConfig;
import cz.burios.ux.cancel.config.db.DBUpdarerConfig;
import cz.burios.ux.uniql.DBContextConfig;

public class WebApplicationIntializer extends AbstractAnnotationConfigDispatcherServletInitializer {

	@Override
	protected Class<?>[] getRootConfigClasses() {
		return new Class[] {
			ApplicationDefineConfig.class,
			DBUpdarerConfig.class,
			DBContextConfig.class, 
			// JerseyResourceConfig.class 
		};
	}

	@Override
	protected Class<?>[] getServletConfigClasses() {
		return new Class[] { 
			WebMvcConfig.class, 
			// JerseyResourceConfig.class 
		};
	}

	@Override
	protected String[] getServletMappings() {
		return new String[] { "/" };
	}

	@Override
	protected String getServletName() {
		return "mwc-servlet";
	}

	@Override
	protected FrameworkServlet createDispatcherServlet(WebApplicationContext wac) {
		// System.out.println("WebApplicationIntializer.createDispatcherServlet()");
		DispatcherServlet ds = new DispatcherServlet(wac);
		ds.setDetectAllHandlerExceptionResolvers(false);
		return ds;
	}
	
}