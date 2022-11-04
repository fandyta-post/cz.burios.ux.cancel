package cz.burios.ux.cancel.model.sync.google;

import com.google.api.client.util.Key;

public class StoredCredentials {
	
	@Key
	private Long expires;
	
	@Key
	private String accessToken;
	
	@Key
	private String status;
	
	@Key
	private String refreshToken;
	
	@Key
	private String authorizationUrl;
	
	@Key
	private String authUri;
	
	@Key
	private String tokenUri;
	
	@Key
	private String configData;

	public Long getExpires() {
		return expires;
	}

	public void setExpires(Long expires) {
		this.expires = expires;
	}

	public String getAccessToken() {
		return accessToken;
	}

	public void setAccessToken(String accessToken) {
		this.accessToken = accessToken;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getRefreshToken() {
		return refreshToken;
	}

	public void setRefreshToken(String refreshToken) {
		this.refreshToken = refreshToken;
	}

	public String getAuthorizationUrl() {
		return authorizationUrl;
	}

	public void setAuthorizationUrl(String authorizationUrl) {
		this.authorizationUrl = authorizationUrl;
	}

	public String getAuthUri() {
		return authUri;
	}

	public void setAuthUri(String authUri) {
		this.authUri = authUri;
	}

	public String getTokenUri() {
		return tokenUri;
	}

	public void setTokenUri(String tokenUri) {
		this.tokenUri = tokenUri;
	}

	public String getConfigData() {
		return configData;
	}

	public void setConfigData(String configData) {
		this.configData = configData;
	}
	
}
