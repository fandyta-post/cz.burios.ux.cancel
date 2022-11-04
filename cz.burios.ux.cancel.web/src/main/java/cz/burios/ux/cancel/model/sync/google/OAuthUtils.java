package cz.burios.ux.cancel.model.sync.google;

import java.io.IOException;
import java.io.StringReader;
import java.security.GeneralSecurityException;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
/*
import javax.persistence.EntityManager;
*/
import org.apache.commons.lang3.StringUtils;

import com.google.api.client.auth.oauth2.AuthorizationCodeFlow;
import com.google.api.client.auth.oauth2.AuthorizationCodeRequestUrl;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.GenericUrl;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.oauth2.Oauth2;
import com.google.api.services.oauth2.model.Tokeninfo;
//import com.google.api.services.plus.Plus;
/*
import com.smart4web.bakagoocal.backend.Configuration;
import com.smart4web.bakagoocal.backend.JPAManager;
import com.smart4web.bakagoocal.backend.User;
*/

public class OAuthUtils {
	
	public static final String appName = "Buriosca-Cancel-Client";
	
	/**
	 * Vraci tridu GoogleClientSecrets, ktera obsahuje jedniecne ID oznacujici
	 * aplikaci a ktere jsou dostupne v Google developer console.
	 * 
	 * @param config
	 * @param configId
	 * @return
	 * @throws IOException
	 */
	public static GoogleClientSecrets getClientSecrets(Map<String, String> config, String configId) throws IOException {
		String jsonSecret = config.get(configId);
		if (StringUtils.isBlank(jsonSecret))
			throw new IllegalStateException("Blank configId parameter.");
		
		GoogleClientSecrets clientSecrets = null;
		JacksonFactory jsonFactory = JacksonFactory.getDefaultInstance();
		
		try (StringReader sr = new StringReader(jsonSecret)) {
			clientSecrets = GoogleClientSecrets.load(jsonFactory, sr);
		}
		return clientSecrets;
	}
	
	/**
	 * Vytvori AuthorizationCodeFlow, ze ktereho je mozne
	 * vygenerovat authorization URL nebo pozadat o pristupove tokeny.
	 * 
	 * @param scopes
	 * @param config
	 * @param configId
	 * @return
	 * @throws GeneralSecurityException
	 * @throws IOException
	 * @see https://developers.google.com/identity/protocols/OAuth2
	 */
	public static AuthorizationCodeFlow initCodeFlow(Collection<String> scopes, Map<String, String> config, String configId)
			throws GeneralSecurityException, IOException {
		
		HttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
		JacksonFactory jsonFactory = JacksonFactory.getDefaultInstance();
		
		GoogleClientSecrets clientSecrets = getClientSecrets(config, configId);
		
		if (clientSecrets == null
				|| clientSecrets.getDetails().getClientId() == null
				|| clientSecrets.getDetails().getClientSecret() == null) {
			throw new IllegalStateException("client_secrets not well formed.");
		}
		
		GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
				httpTransport, jsonFactory, clientSecrets, scopes)
			.setAuthorizationServerEncodedUrl(clientSecrets.getDetails().getAuthUri())
			.setTokenServerUrl(new GenericUrl(clientSecrets.getDetails().getTokenUri()))
			.setAccessType("offline")
			//.setApprovalPrompt("force")
			.build();
		
		return flow;
	}
	
	/**
	 * Vygeneruje adresu, na kterou je potreba presmerovat uzivatele a na ktere
	 * povoli nebo odmitne pristup k pozadovanym API Googlu.
	 * 
	 * @param scopes
	 * @param config
	 * @param configId
	 * @param state
	 * @return
	 * @throws GeneralSecurityException
	 * @throws IOException
	 * @see https://developers.google.com/identity/protocols/OAuth2
	 */
	public static String buildAuthorizationUrl(Collection<String> scopes, Map<String, String> config, String configId, String state, boolean include_granted_scopes)
			throws GeneralSecurityException, IOException {
		
		String redirectUrl = config.get("redirectUrl");
		
		if (StringUtils.isBlank(redirectUrl))
			throw new IllegalStateException("Blank redirectUrl.");
		
		AuthorizationCodeFlow flow = initCodeFlow(scopes, config, configId);
		AuthorizationCodeRequestUrl codeRequestUrl = flow.newAuthorizationUrl()
				.setRedirectUri(redirectUrl)
				.setState(state);
		
		if (include_granted_scopes)
			codeRequestUrl.set("include_granted_scopes", true);
		
		/*
		String authorizationUrl = flow.newAuthorizationUrl()
				.setRedirectUri(redirectUrl)
				.setState(state)
				.build();
		*/
		String authorizationUrl = codeRequestUrl.build();
		
		return authorizationUrl;
	}
	
	/**
	 * Pozada o vytvoreni noveho access a request tokenu na zaklade autorizacniho kodu,
	 * ktery je zaslan na callbacku adresu po povoleni pristupu ke sluzbe uzivatelem.
	 * 
	 * @param code
	 * @param config
	 * @param configId
	 * @param scopes
	 * @return
	 * @throws GeneralSecurityException
	 * @throws IOException
	 */
	public static Credential requestNewToken(String code, Map<String, String> config, String configId, Collection<String> scopes)
			throws GeneralSecurityException, IOException {
		
		String redirectUrl = config.get("redirectUrl");
		
		if (StringUtils.isBlank(redirectUrl))
			throw new IllegalStateException("Blank redirectUrl.");
		
		Credential credential = null;
		AuthorizationCodeFlow flow = initCodeFlow(scopes, config, configId);
		
		TokenResponse response = flow.newTokenRequest(code)
				.setRedirectUri(redirectUrl).execute();
		
		HttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
		JacksonFactory jsonFactory = JacksonFactory.getDefaultInstance();
		
		GoogleClientSecrets clientSecrets = getClientSecrets(config, configId);
		
		credential = new GoogleCredential.Builder()
				.setTransport(httpTransport)
				.setJsonFactory(jsonFactory)
				.setClientSecrets(clientSecrets)
				.setTokenServerEncodedUrl(clientSecrets.getDetails().getTokenUri())
				.build()
				.setFromTokenResponse(response)
				;
		
		return credential;
	}
	
	/**
	 * Overi validitu access tokenu volanim metody tokeninfo.
	 * 
	 * @param credentials
	 * @param config
	 * @param configId
	 * @return
	 * @see https://developers.google.com/identity/protocols/OAuth2UserAgent#tokeninfo-validation
	 */
	public static boolean isValidAccessToken(Credential credentials, Map<String, String> config, String configId) {
		boolean isValid = false;
		
		try {
			JacksonFactory jsonFactory = JacksonFactory.getDefaultInstance();
			
			Oauth2 oauth2 = new Oauth2.Builder(
					GoogleNetHttpTransport.newTrustedTransport(),
					jsonFactory, credentials)
					.setApplicationName(appName)
				    .build();
			
			Tokeninfo tokenInfo = oauth2.tokeninfo().setAccessToken(credentials.getAccessToken()).execute();
			
			//tokenInfo.getEmail()
			//System.out.println(tokenInfo.toPrettyString());
			
			String audience = tokenInfo.getAudience();
			GoogleClientSecrets clientSecrets = getClientSecrets(config, configId);
			String clientId = clientSecrets.getDetails().getClientId();
			
			if (StringUtils.equals(audience, clientId)) {
				if (tokenInfo.getExpiresIn() > 0)
					isValid = true;
			}
		} catch (Exception x) { }
		
		return isValid;
	}
	
	/**
	 * Vraci Tokeninfo pro zadany access token nebo null, pokud behem volani
	 * https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=1/fFBGRNJru1FQd44AzqT3Zg
	 * doslo k chybe. To plati i pro pripad, kdy jiz token neni validni a server vraci HTTP kod 400.
	 * 
	 * 
	 * @param credentials
	 * @return
	 */
	public static Tokeninfo getTokeninfo(Credential credentials) {
		Tokeninfo tokenInfo = null;
		
		try {
			JacksonFactory jsonFactory = JacksonFactory.getDefaultInstance();
			
			Oauth2 oauth2 = new Oauth2.Builder(
					GoogleNetHttpTransport.newTrustedTransport(),
					jsonFactory, credentials)
					.setApplicationName(appName)
				    .build();
			
			tokenInfo = oauth2.tokeninfo().setAccessToken(credentials.getAccessToken()).execute();

		} catch (Exception x) { }
		
		return tokenInfo;
	}
	/*
	public static Tokeninfo getTokeninfo(User user) {
		Tokeninfo tokenInfo = null;
		
		try {
			Map<String, String> config = buildConfigMap("");
			GoogleClientSecrets clientSecrets = getClientSecrets(config, "configGoogle");
			GoogleCredential credentials = buildGoogleCredential(clientSecrets, user.getAccessToken(), user.getRefreshToken(), user.getTokenExpires());
			tokenInfo = getTokeninfo(credentials);
		} catch (Exception x) { }
		
		return tokenInfo;
	}
	*/
	public static Calendar initCalendarService(Credential credentials) throws GeneralSecurityException, IOException {
		HttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
		JacksonFactory jsonFactory = JacksonFactory.getDefaultInstance();
		
		Calendar calendar = new Calendar.Builder(httpTransport, jsonFactory, credentials)
				.setApplicationName(appName)
			    .build();
		
		return calendar;
	}
	/*
	public static Calendar initCalendarServiceForUser(User user, AtomicBoolean tokenRefreshed) throws IOException, GeneralSecurityException {
		Map<String, String> config = buildConfigMap("");
		GoogleClientSecrets clientSecrets = getClientSecrets(config, "configGoogle");
		GoogleCredential credentials = buildGoogleCredential(clientSecrets, user.getAccessToken(), user.getRefreshToken(), user.getTokenExpires());
		
		long expiresInSeconds = credentials.getExpiresInSeconds();
		if (expiresInSeconds <= 5) {
			tokenRefreshed.set(credentials.refreshToken());
			if (tokenRefreshed.get()) {
				user.setAccessToken(credentials.getAccessToken());
				user.setTokenExpires(credentials.getExpirationTimeMilliseconds());
				JPAManager.persistUser(user);
			}
		}
		
		Calendar service = initCalendarService(credentials);
		return service;
	}
	*/
	/*
	public static Gmail initGmailService(Credential credentials) throws GeneralSecurityException, IOException {
		HttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
		JacksonFactory jsonFactory = JacksonFactory.getDefaultInstance();
		
		Gmail gmail = new Gmail.Builder(httpTransport, jsonFactory, credentials)
				.setApplicationName(appName)
			    .build();
		
		return gmail;
	}
	*/
	/*
	public static Gmail initGmailServiceForUser(User user, AtomicBoolean tokenRefreshed) throws IOException, GeneralSecurityException {
		Map<String, String> config = buildConfigMap("");
		GoogleClientSecrets clientSecrets = getClientSecrets(config, "configGoogle");
		GoogleCredential credentials = buildGoogleCredential(clientSecrets, user.getAccessToken(), user.getRefreshToken(), user.getTokenExpires());
		
		long expiresInSeconds = credentials.getExpiresInSeconds();
		if (expiresInSeconds <= 5) {
			tokenRefreshed.set(credentials.refreshToken());
			if (tokenRefreshed.get()) {
				user.setAccessToken(credentials.getAccessToken());
				user.setTokenExpires(credentials.getExpirationTimeMilliseconds());
				JPAManager.persistUser(user);
			}
		}
		
		Gmail service = initGmailService(credentials);
		return service;
	}
	*/
	public static GoogleCredential buildGoogleCredential(GoogleClientSecrets clientSecrets,
			String accessToken, String refreshToken, long expiration) throws GeneralSecurityException, IOException {
		HttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
		JacksonFactory jsonFactory = JacksonFactory.getDefaultInstance();
		
		return new GoogleCredential.Builder()
				.setTransport(httpTransport)
				.setJsonFactory(jsonFactory)
				.setClientSecrets(clientSecrets)
				//.setTokenServerEncodedUrl("")
				.build()
				.setAccessToken(accessToken)
				.setRefreshToken(refreshToken)
				.setExpirationTimeMilliseconds(expiration)
				;
	}
	/*
	public static Map<String, String> buildConfigMap(String redirectUrl) throws IOException {
		Map<String, String> config = new HashMap<>();
		EntityManager em = JPAManager.getEntityManagerFactory().createEntityManager();
		try {
			config.put("redirectUrl", redirectUrl);
			Configuration configItem = em.find(Configuration.class, "configGoogle");
			config.put("configGoogle", configItem.getValue());
		} finally {
			em.close();
		}
		
		return config;
	}
	*/
}
