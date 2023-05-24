package cz.burios.ux.cancel.controller;

import java.util.List;

import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.ui.ModelMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import cz.burios.ux.cancel.model.UserCredentials;
import cz.burios.ux.cancel.service.UserCredentialsService;
import cz.burios.ux.core.config.ApplicationDefine;

@Controller
@RequestMapping("/auth")
public class UserCredentialsController {

	@Autowired private ApplicationDefine info;
	@Autowired private UserCredentialsService service; 
	@Autowired private BCryptPasswordEncoder passwordEncoder;
	
	@GetMapping("/user_registration")
	public ModelAndView loginPage(@RequestParam(value = "error", required = false) String error, Model model) {
		// ModelAndView view = new ModelAndView("user_registration");
		ModelAndView view = new ModelAndView("desktop_user_registration");
		try {
			if (error != null && !error.isEmpty()) {
				switch (error) {
					case "E900": view.addObject("error", "Username already exists"); break;
				}
			}
			UserCredentials user = new UserCredentials();
			user.setUserRole("ROLE_USER");
			user.setEnabled(Boolean.TRUE);
			view.addObject("user", user);
			view.addObject("info", info);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return view;
	}

	@RequestMapping(value="/user_registration", method=RequestMethod.POST, consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
	public ModelAndView addRecord(@RequestBody MultiValueMap<String, String> formData, ModelMap model) {
		System.out.println("UserCredentialsController.addRecord().formData: " + formData);
		ModelAndView view = new ModelAndView("redirect:/auth/login");
		try {
			String userName = formData.getFirst("userName");
			List<UserCredentials> users = service.getRecordByWhere("USER_NAME = ?", userName);
			if (users == null || users.isEmpty()) {
				UserCredentials user = 	new UserCredentials();
				user.setUserName(formData.getFirst("userName"));
				String userPassword = formData.getFirst("userPassword");
				String password = "" + passwordEncoder.encode(userPassword);
				user.setUserPassword(password);
				user.setUserRole("ROLE_USER");
				user.setEnabled(Boolean.TRUE);
				String suffix =  RandomStringUtils.random(11, true, true).toUpperCase();
				user.setId("US01_"  + suffix);
				user.setUserId("US00_"  + suffix);
				// System.out.println("UserCredentialsController.addRecord().service: " + service);
				try {
					service.addRecord(user);
					model.addAttribute("record", user);			
				} catch (DataAccessException e) {
					String msg = e.getMessage();
					String err = "";
					if (msg.contains("Duplicate entry") && msg.contains("for key 'USER_NAME';")) {
						err = "E900";
					} else {
						e.printStackTrace();
						err = "";
					}
					view.setViewName("redirect:/auth/user_registration?error=" + err);
				}
			} else {
				view.setViewName("redirect:/auth/user_registration?error=E900"); 
			}
		} catch (DataAccessException e) {
			e.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return view;
	}
}