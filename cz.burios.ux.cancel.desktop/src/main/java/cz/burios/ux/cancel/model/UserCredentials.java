package cz.burios.ux.cancel.model;

public class UserCredentials {
	
	private String id;
	private String userId;
	private String userName;
	private String userPassword;
	private String userRole;
	private Boolean enabled;
	
	public UserCredentials() {
		super();
	}
	
	public UserCredentials(String id, String userId, String userName, String userPassword, String userRole, Boolean enabled) {
		super();
		this.id = id;
		this.userId = userId;
		this.userName = userName;
		this.userPassword = userPassword;
		this.userRole = userRole;
		this.enabled = enabled;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public String getUserPassword() {
		return userPassword;
	}

	public void setUserPassword(String userPassword) {
		this.userPassword = userPassword;
	}

	public String getUserRole() {
		return userRole;
	}

	public void setUserRole(String userRole) {
		this.userRole = userRole;
	}

	public Boolean getEnabled() {
		return enabled;
	}

	public void setEnabled(Boolean enabled) {
		this.enabled = enabled;
	}
	
	@Override
	public String toString() {
		return "UserCredentials ["
					+ "id=" + id + ", "
					+ "userId=" + userId + ", "
					+ "userName=" + userName + ", "
					+ "userPassword="
					+ userPassword + ", "
					+ "userRole=" + userRole + ", "
					+ "enabled=" + enabled
				+ "]";
	}
	
}
