package cz.burios.ux.cancel.model.sync.google;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;

/**
 * Zde vytvorit pristup pro aplikaci:
 * https://console.developers.google.com/
 * 
 * @author burioca.cz
 *
 */
@SuppressWarnings("serial")
@WebServlet("/app/pages/google-oauth-callback")
public class LoginServlet extends HttpServlet {

	String TOKEN_ID = "";
 
    public LoginServlet() {
        super();
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    	// doPost(request, response);
    	System.out.println("LoginServlet.doGet()");
    	super.doGet(request, response);
    }
    
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.setContentType("text/html");
		try {
			String idToken = request.getParameter("id_token");
		
			System.out.println("--------------------");
			
			Map<String, Object> params = request2params(request);
			for (Map.Entry<String, Object> entry : params.entrySet()) {
				System.out.println(entry.getKey() + " = " + entry.getValue());
			}
			System.out.println("idToken: " + idToken);
			/*
			GoogleIdToken.Payload payLoad = IdTokenVerifierAndParser.getPayload(idToken);
						
			System.out.println("--------------------");
			Set<Map.Entry<String, Object>> entries = payLoad.entrySet();
			for (Map.Entry<String, Object> entry : entries) {
				System.out.println(entry.getKey() + " = " + entry.getValue());
			}
			System.out.println("--------------------");
			*/
// ??			request.getServletContext().getRequestDispatcher("/cacel/jps/google_oauth2.jsp").forward(request, response);
			PrintWriter out = response.getWriter();
			out.println("OK");
			// request.getRequestDispatcher("/cancel/jps/google_oauth2.jsp").forward(request,response);
			// http://localhost:9080/cancel/jsp/google-oauth.jsp
			
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	protected Map<String, Object> request2params(HttpServletRequest request) {
		Map<String, Object> params = new HashMap<String, Object>(); 
		Enumeration<String> e = request.getParameterNames();
		while (e.hasMoreElements()) {
			String key = e.nextElement();
			params.put(key, request.getParameter(key));
		}
		e = request.getAttributeNames();
		while (e.hasMoreElements()) {
			String key = e.nextElement();
			params.put(key, request.getAttribute(key));
		}
		return params;
	}

}
