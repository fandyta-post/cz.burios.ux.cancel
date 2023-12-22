package cz.burios.ux.cancel.model.sync.google;

import java.net.URISyntaxException;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.UnrecoverableKeyException;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.HashMap;
import java.util.Map;

import javax.net.ssl.SSLContext;

import org.apache.commons.lang3.StringUtils;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.conn.ClientConnectionManager;
import org.apache.http.conn.scheme.PlainSocketFactory;
import org.apache.http.conn.scheme.Scheme;
import org.apache.http.conn.scheme.SchemeRegistry;
import org.apache.http.conn.ssl.TrustStrategy;
import org.apache.http.conn.ssl.X509HostnameVerifier;
import org.apache.http.impl.client.DecompressingHttpClient;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.impl.conn.BasicClientConnectionManager;
import org.apache.http.params.CoreConnectionPNames;
import org.apache.http.params.HttpParams;
import org.apache.http.protocol.HttpContext;
import org.apache.http.util.EntityUtils;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.common.base.Charsets;

import cz.burios.utils.PasswordUtils;

public class GoogleOAuthHelper {

	// For credential "youda"
	/*
	protected static final String CLIENT_ID = "936737592722-cpnsuiahcgg4n0v8rqoorcvmds5dob09.apps.googleusercontent.com";
	protected static final String CLIENT_SECRET = "jgx3a7bT1SFMMkbk643yqNYR";
	*/
	
	// For credential "cancel"
	/*
	public static final String CLIENT_ID = "381305505484-pu1al84lcj8g1kj5ue7jc0v7b41o96tr.apps.googleusercontent.com";
	public static final String CLIENT_SECRET = "Utq0NQhTPmmNIX4z3W4H29BZ";
	*/
	
	// buriosca@gmail.com (Buriosca - Cancel)
	public static final String CLIENT_ID = "597381075640-msekc4h56qt8bed4ai6dklftk5t7hh0s.apps.googleusercontent.com";
	public static final String CLIENT_SECRET = "8zx-VvohBPWZs1zMbp6wtegW";
	
	// For credential "wencabur - Buriosca Cancel"
	/*
	public static final String CLIENT_ID = "926486832186-57q6curcrkaqhblchs6j1pt2fn3socrp.apps.googleusercontent.com";
	public static final String CLIENT_SECRET = "ckpjqIzFx7oV_ou9ljUgnhCe";
	*/
	// private static final String cryptKey = "8G4SDYUcn7850gfh[fd*3nb";
	// private static final String httpClientAppName = "Smart4Web";

	
	public GoogleOAuthHelper() {

	}

	public Credential loadCredentials(final String userName, final String scopes, String configId) {
		Credential credential = null;
		HttpClient httpClient = null;

		try {
			//$ httpClient = getHttpClient();
					
			String googleLoginServiceUrl = "https://login.smart4web.cz";

			URIBuilder ub = new URIBuilder(googleLoginServiceUrl + "/credentials");
			ub.addParameter("user", userName);
			// ub.addParameter("auth", PasswordUtils.aesEncrypt(userName, cryptKey));
			ub.addParameter("scopes", scopes);
			ub.addParameter("configId", configId);

			Map<String, String> headers = new HashMap<String, String>();
			headers.put("X-S4W-Auth", PasswordUtils.aesEncrypt(userName, CLIENT_SECRET /* cryptKey */));

			HttpGet httpGet = new HttpGet(ub.build());

			for (String headerName : headers.keySet())
				httpGet.addHeader(headerName, headers.get(headerName));

			//HttpResponse response = httpClient.execute(httpGet);
			//HttpEntity entity = response.getEntity();

			HttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
			JacksonFactory jsonFactory = JacksonFactory.getDefaultInstance();

			StoredCredentials storedCredentials = null;
			/*
			if ((response.getStatusLine().getStatusCode() / 100) == 2) {
				try (InputStream is = entity.getContent()) {
					storedCredentials = jsonFactory.fromInputStream(is, Charsets.UTF_8, StoredCredentials.class);
				}

				if (storedCredentials != null) {
					if (StringUtils.equals(storedCredentials.getStatus(), "credentialsFound")) {
						GoogleClientSecrets clientSecrets = null;

						String configData = storedCredentials.getConfigData();
						if (configData != null)
							configData = PasswordUtils.aesDecrypt(configData, CLIENT_SECRET);

						try (StringReader sr = new StringReader(configData)) {
							clientSecrets = GoogleClientSecrets.load(jsonFactory, sr);
						}

						credential = new GoogleCredential.Builder().setTransport(httpTransport)
								.setJsonFactory(jsonFactory).setClientSecrets(clientSecrets)
								.setTokenServerEncodedUrl(storedCredentials.getTokenUri()).build()
								.setAccessToken(storedCredentials.getAccessToken())
								.setRefreshToken(storedCredentials.getRefreshToken())
								.setExpirationTimeMilliseconds(storedCredentials.getExpires());
					}
				}

			} else {
				// EntityUtils.consumeQuietly(entity);
			}
			*/
			
			
		} catch (Exception x) {
			x.printStackTrace();
		} finally {
			try {
				if (httpClient != null)
					httpClient.getConnectionManager().shutdown();
			} catch (Exception x) {
			}
		}

		return credential;
	}

	/**
	 * Vraci novou instanci {@link org.apache.http.client.HttpClient HTTP klienta},
	 * ktera neoveruje certifkacni autority pro HTTPS.
	 * Timeout pro spojeni a cekani na data nastavi na 30 sekund.
	 * 
	 * @return
	 * @throws URISyntaxException
	 * @throws KeyManagementException
	 * @throws UnrecoverableKeyException
	 * @throws NoSuchAlgorithmException
	 * @throws KeyStoreException
	 */
	public HttpClient getHttpClient() throws URISyntaxException, KeyManagementException, UnrecoverableKeyException, NoSuchAlgorithmException, KeyStoreException {
		return getHttpClient("TLS", 30000);
	}
	
	public HttpClient getHttpClient(String protocol, int timeout) throws URISyntaxException, KeyManagementException, UnrecoverableKeyException, NoSuchAlgorithmException, KeyStoreException {
		HttpClient httpClient = null;

		// Inicializace HTTP klienta. Povoleni HTTPS i s neznamymi autoritami.
		TrustStrategy acceptingTrustStrategy = new TrustStrategy() {
			public boolean isTrusted(X509Certificate[] chain, String authType) throws CertificateException {
				return true;
			}
		};
		
		if (StringUtils.isBlank(protocol))
			protocol = "TLS";
		
		SSLContext ctx = SSLContext.getInstance(protocol);
		/*
		X509TrustManager tm = new X509TrustManager() {
			public void checkClientTrusted(X509Certificate[] xcs, String string) throws CertificateException {
			}

			public void checkServerTrusted(X509Certificate[] xcs, String string) throws CertificateException {
			}

			public X509Certificate[] getAcceptedIssuers() {
				return null;
			}
		};

		X509HostnameVerifier verifier = new X509HostnameVerifier() {
			public boolean verify(String arg0, SSLSession arg1) {
				return true;
			}

			public void verify(String host, SSLSocket ssl) throws IOException {
			}

			public void verify(String host, X509Certificate cert) throws SSLException {
			}

			public void verify(String host, String[] cns, String[] subjectAlts) throws SSLException {
			}
		};

		ctx.init(null, new TrustManager[] { tm }, null);

		SSLSocketFactory sf = new org.apache.http.conn.ssl.SSLSocketFactory(ctx, verifier);

		SchemeRegistry registry = new SchemeRegistry();
		registry.register(new Scheme("https", 443, sf));
		registry.register(new Scheme("http", 80, PlainSocketFactory.getSocketFactory()));

		ClientConnectionManager ccm = new BasicClientConnectionManager(registry);

		DefaultHttpClient dhc = new DefaultHttpClient(ccm);
		dhc.getParams().setParameter(CoreConnectionPNames.CONNECTION_TIMEOUT, timeout);
		dhc.getParams().setParameter(CoreConnectionPNames.SO_TIMEOUT, timeout);
		dhc.setRedirectStrategy(new LaxRedirectStrategy());

		HttpClient httpClient = new DecompressingHttpClient(dhc);
		*/
		SchemeRegistry registry = new SchemeRegistry();
		ClientConnectionManager ccm = new BasicClientConnectionManager(registry);
		DefaultHttpClient dhc = new DefaultHttpClient(ccm);
		httpClient = new DecompressingHttpClient(dhc);
		
		return httpClient;
	}

}
