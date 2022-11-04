<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<%@ page import="cz.burios.ux.cancel.model.sync.google.GoogleOAuthHelper"%>

<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	
	<script src="//ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
	<script src="https://apis.google.com/js/platform.js" async defer></script>
	
	<meta name="google-signin-scope" content="profile people">
	<meta name="google-signin-client_id" content="<%= GoogleOAuthHelper.CLIENT_ID %>">
	<title>Burioc.cz - Cancel</title>
</head>
<body>
	<div style="margin: 15px;">
		<div class="g-signin2" data-onsuccess="onSignIn"></div>
		<script>
		function onSignIn(googleUser) {
			var profile = googleUser.getBasicProfile();
			console.log('ID: ' + profile.getId());
			console.log('Name: ' + profile.getName());
			console.log('Image URL: ' + profile.getImageUrl());
			console.log('Email: ' + profile.getEmail());
			console.log('id_token: ' + googleUser.getAuthResponse().id_token);
			
			var redirectUrl = "/cas/app/pages/google-oauth-callback";
			
			var form = $(
				'<form action="' + redirectUrl + '" method="post">' +
					'<input type="text" name="id_token" value="' + googleUser.getAuthResponse().id_token + '" />' +
				'</form>'
			);
			$("body").append(form);
			form.submit();
		}
		</script>
	</div>
</body> 	
</body>
</html>
<%--
--%>