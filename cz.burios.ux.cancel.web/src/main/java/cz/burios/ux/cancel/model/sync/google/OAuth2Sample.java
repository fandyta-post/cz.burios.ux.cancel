package cz.burios.ux.cancel.model.sync.google;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.extensions.java6.auth.oauth2.AuthorizationCodeInstalledApp;
import com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.client.util.store.DataStoreFactory;
import com.google.api.client.util.store.FileDataStoreFactory;
import com.google.api.services.oauth2.Oauth2;
import com.google.api.services.oauth2.model.Tokeninfo;
import com.google.api.services.oauth2.model.Userinfoplus;

import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Arrays;
import java.util.List;

/**
 * Command-line sample for the Google OAuth2 API described at
 * <a href="http://code.google.com/apis/accounts/docs/OAuth2Login.html">Using
 * OAuth 2.0 for Login (Experimental)</a>.
 *
 */
public class OAuth2Sample {

	private static final String APPLICATION_NAME = "BuriosCancelClient";

	/** Directory to store user credentials. */
	private static java.io.File DATA_STORE_DIR = null; 

	/**
	 * Global instance of the {@link DataStoreFactory}. The best practice is to make
	 * it a single globally shared instance across your application.
	 */
	private static FileDataStoreFactory dataStoreFactory;

	/** Global instance of the HTTP transport. */
	private static HttpTransport httpTransport;

	/** Global instance of the JSON factory. */
	private static final JsonFactory JSON_FACTORY = JacksonFactory.getDefaultInstance();

	/** OAuth 2.0 scopes. */
	private static final List<String> SCOPES = Arrays.asList(
		"https://www.googleapis.com/auth/userinfo.profile",
		//"https://www.googleapis.com/auth/userinfo.people",
		//"https://www.googleapis.com/auth/userinfo.calendar",
		"https://www.googleapis.com/auth/userinfo.email"
	);

	private static Oauth2 oauth2;
	private static GoogleClientSecrets clientSecrets;

	/** 
	 * Authorizes the installed application to access user's protected data.
	 */
	private static Credential authorize() throws Exception {
		clientSecrets = GoogleClientSecrets.load(
			JSON_FACTORY, new InputStreamReader(OAuth2Sample.class.getResourceAsStream("/client_secrets.json"))
		);
		if (clientSecrets.getDetails().getClientId().startsWith("Enter") || clientSecrets.getDetails().getClientSecret().startsWith("Enter ")) {
			System.out.println(
				"Enter Client ID and Secret from https://code.google.com/apis/console/ " + 
				"into <project>/src/main/resources/client_secrets.json");
			System.exit(1);
		}
		// set up authorization code flow
		GoogleAuthorizationCodeFlow flow = 
			new GoogleAuthorizationCodeFlow.Builder(httpTransport, JSON_FACTORY, clientSecrets, SCOPES)
					.setDataStoreFactory(dataStoreFactory).build();
		// authorize
		return new AuthorizationCodeInstalledApp(flow, new LocalServerReceiver()).authorize("user");
	}

	public static void main(String[] args) {
		try {
			String userId = "UR-X-0000000001"; // buriosca@gmail.com
			/*
			String userId = "UR-X-0000000003"; // wencabur@gmail.com			mcouscz68
			String userId = "UR-X-0000001005"; // dytrychovajitka@gmail.com		mcous_Cz68
			String userId = "UR-X-0000001129"; // jarrycz68@gmail.com			
			String userId = "UR-X-0000001873"; // turki.mary.1873@gmail.com		Tur.Mar.18
			String userId = "UR-X-0000001883"; // wencabur@gmail.com
			 */
			
			httpTransport = GoogleNetHttpTransport.newTrustedTransport();
			DATA_STORE_DIR = new java.io.File("e:/DATA/repo/burios", "/cancel/credentials/" + userId);
			dataStoreFactory = new FileDataStoreFactory(DATA_STORE_DIR);
			// authorization
			Credential credential = authorize();
			// set up global Oauth2 instance
			oauth2 = new Oauth2.Builder(httpTransport, JSON_FACTORY, credential).setApplicationName(APPLICATION_NAME).build();
			// run commands
			tokenInfo(credential.getAccessToken());
			userInfo();
			// success!
			return;
		} catch (IOException e) {
			System.err.println(e.getMessage());
		} catch (Throwable t) {
			t.printStackTrace();
		}
		System.exit(1);
	}

	private static void tokenInfo(String accessToken) throws IOException {
		header("Validating a token");
		Tokeninfo tokeninfo = oauth2.tokeninfo().setAccessToken(accessToken).execute();
		System.out.println(tokeninfo.toPrettyString());
		if (!tokeninfo.getAudience().equals(clientSecrets.getDetails().getClientId())) {
			System.err.println("ERROR: audience does not match our client ID!");
		}
	}

	private static void userInfo() throws IOException {
		header("Obtaining User Profile Information");
		Userinfoplus userinfo = oauth2.userinfo().get().execute();
		System.out.println(userinfo.toPrettyString());
	}

	static void header(String name) {
		System.out.println();
		System.out.println("================== " + name + " ==================");
		System.out.println();
	}
}
