package cz.burios.ux.cancel.service;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import cz.burios.ux.cancel.dao.UserDetialsDao;
import cz.burios.ux.cancel.model.UserDetails;

@Service
public class UserAuthService implements UserDetailsService {

	@Autowired
	private UserDetialsDao userDetialsDao;

	@Override
	public org.springframework.security.core.userdetails.UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		UserDetails userDetails = userDetialsDao.getUser(username);
		if (userDetails == null) { // should have proper handling of Exception
			throw new UsernameNotFoundException("User '" + username + "' not found.");
		}
		GrantedAuthority grantedAuthority = new SimpleGrantedAuthority(userDetails.getRole());
		org.springframework.security.core.userdetails.UserDetails details = 
			new User(userDetails.getUsername(), userDetails.getPassword(), Arrays.asList(grantedAuthority));

		return details;
	}
}
