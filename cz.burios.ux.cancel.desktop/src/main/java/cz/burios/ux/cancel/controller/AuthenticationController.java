package cz.burios.ux.cancel.controller;

import org.apache.commons.lang3.time.DateFormatUtils;
/*
import java.io.IOException;
import java.util.Arrays;

import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
 */
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.MessageSourceAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
/*
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
 */
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import cz.burios.utils.Serializer;
import cz.burios.ux.core.config.ApplicationDefine;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Controller
@RequestMapping("/")
public class AuthenticationController implements MessageSourceAware {
	
	@Autowired 
	private ApplicationDefine info;
	
	@SuppressWarnings("unused")
	private MessageSource messageSource;

	@Override
	public void setMessageSource(MessageSource messageSource) {
		this.messageSource = messageSource;
	}

	@RequestMapping(path = { "/", "/auth/login" })
	public ModelAndView loginPage(Model model, @RequestParam(value = "error", required = false) String error, @RequestParam(value = "logout", required = false) String logout) {
		ModelAndView view = new ModelAndView("desktop_login");
		try {
			Boolean autheticable = (Boolean) info.getOption("autheticable", Boolean.TRUE);
			Serializer serializer = new Serializer();
			if (autheticable) {
				if (error != null) {
					view.addObject("error", "Chyba prihlaseni.");
				}
				if (logout != null) {
					view.addObject("msg", "Byl jste odhlasen.");
				}
			} else {
				view = new ModelAndView("p/desktop");
			}
			view.addObject("time", DateFormatUtils.format(new java.util.Date(), "yyyyMMddHHmmss"));
			view.addObject("serializer", serializer);
			view.addObject("info", info);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return view;
	}

	@RequestMapping("/auth/logout")
	public ModelAndView logoutPage(Model model, HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
		ModelAndView view = new ModelAndView("redirect:/auth/login?logout");
		try {
			Authentication auth = SecurityContextHolder.getContext().getAuthentication();
			if (auth instanceof OAuth2AuthenticationToken) {
				/*
				OAuth2AuthenticationToken oauth2 = (OAuth2AuthenticationToken) auth;
			    OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient(oauth2.getAuthorizedClientRegistrationId(), oauth2.getName());
			    String ACCESS_TOKEN = client.getAccessToken().getTokenValue();
				// System.out.println("ACCESS_TOKEN: " + ACCESS_TOKEN);
				
				try {
					CloseableHttpClient httpClient = HttpClientBuilder.create().build();
					HttpPost post = new HttpPost("https://accounts.google.com/o/oauth2/revoke?token=" + ACCESS_TOKEN);
					org.apache.http.HttpResponse httpResponse = httpClient.execute(post);
					// httpResponse.getParams();
					System.out.println("httpResponse: " + httpResponse);
					System.out.println("httpResponse.StatusCode: " + httpResponse.getStatusLine().getStatusCode());

					auth.setAuthenticated(false);
					
				} catch (IOException e) {
					e.printStackTrace();
				}
				System.out.println("Cookies: " + Arrays.asList(request.getCookies()));
				 */
				Cookie cookie = new Cookie("JSESSIONID", "XSRF-TOKEN");
				cookie.setMaxAge(0);
				response.addCookie(cookie);

				SecurityContextLogoutHandler logoutHandler = new SecurityContextLogoutHandler();
				logoutHandler.setClearAuthentication(true);
				logoutHandler.setInvalidateHttpSession(true);
				logoutHandler.logout(request, response, auth);

				request.getSession().invalidate();
				view.addObject("info", info);
				
			} else {
				SecurityContextLogoutHandler logoutHandler = new SecurityContextLogoutHandler();
				logoutHandler.setClearAuthentication(true);
				logoutHandler.setInvalidateHttpSession(true);
				logoutHandler.logout(request, response, auth);

				request.getSession().invalidate();
				view.addObject("info", info);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return view;
	}
}