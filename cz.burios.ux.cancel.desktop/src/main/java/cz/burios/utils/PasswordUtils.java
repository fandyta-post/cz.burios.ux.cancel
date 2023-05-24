package cz.burios.utils;

import java.io.UnsupportedEncodingException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.SecureRandom;
import java.util.regex.Pattern;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.KeyGenerator;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

public class PasswordUtils {

	protected static char[] Hchars = { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F' };
	protected static char[] hchars = { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f' };

	/**
	 * Zasifruje text pomoci AES sifry. Pouziva metodu: AES/ECB/PKCS5Padding
	 * 
	 * @param clearString Text, ktery se ma zakodovat.
	 * @param password    Heslo, ktere se pouzije pro kodovani.
	 * 
	 * @return Vraci zakodovany HEX retezec.
	 * 
	 * @throws InvalidKeyException
	 * @throws NoSuchAlgorithmException
	 * @throws NoSuchPaddingException
	 * @throws IllegalBlockSizeException
	 * @throws BadPaddingException
	 * @throws UnsupportedEncodingException
	 * @throws NoSuchProviderException
	 */
	public static String aesEncrypt(String clearString, String password)
			throws InvalidKeyException, NoSuchAlgorithmException, NoSuchPaddingException, IllegalBlockSizeException,
			BadPaddingException, UnsupportedEncodingException, NoSuchProviderException {
		byte[] rawKey = getRawKey(password.getBytes("UTF-8"));
		byte[] result = aesEncrypt(clearString.getBytes("UTF-8"), rawKey);
		return bytesToHex(result, false);
	}

	/**
	 * Desifruje text pomoci AES sifry, ktery byl puvodne vracen metodou aesEncrypt.
	 * Pouziva metodu: AES/ECB/PKCS5Padding
	 * 
	 * @param hexString HEX retezec, ktery byl puvodne vracen metodou aesEncrypt.
	 * @param password  Heslo, ktere se pouzije pro kodovani.
	 * 
	 * @return Vraci desiforavny text.
	 * 
	 * @throws InvalidKeyException
	 * @throws NoSuchAlgorithmException
	 * @throws NoSuchPaddingException
	 * @throws IllegalBlockSizeException
	 * @throws BadPaddingException
	 * @throws UnsupportedEncodingException
	 * @throws NoSuchProviderException
	 */
	public static String aesDecrypt(String hexString, String password)
			throws InvalidKeyException, NoSuchAlgorithmException, NoSuchPaddingException, IllegalBlockSizeException,
			BadPaddingException, UnsupportedEncodingException, NoSuchProviderException {
		byte[] rawKey = getRawKey(password.getBytes("UTF-8"));
		byte[] enc = hexToBytes(hexString);
		byte[] result = aesDecrypt(enc, rawKey);
		return new String(result, "UTF-8");
	}

	/**
	 * Zasifruje text pomoci AES sifry. Pouziva metodu: AES/ECB/PKCS5Padding
	 * 
	 * @param clearString Text, ktery se ma zakodovat.
	 * @param password    Heslo, ktere se pouzije pro kodovani.
	 * 
	 * @return Vraci zasifrovana data v Base64.
	 * 
	 * @throws InvalidKeyException
	 * @throws NoSuchAlgorithmException
	 * @throws NoSuchPaddingException
	 * @throws IllegalBlockSizeException
	 * @throws BadPaddingException
	 * @throws UnsupportedEncodingException
	 * @throws NoSuchProviderException
	 */
	public static String aesEncryptBase64(String clearString, String password)
			throws InvalidKeyException, NoSuchAlgorithmException, NoSuchPaddingException, IllegalBlockSizeException,
			BadPaddingException, UnsupportedEncodingException, NoSuchProviderException {
		byte[] rawKey = getRawKey(password.getBytes("UTF-8"));
		byte[] result = aesEncrypt(clearString.getBytes("UTF-8"), rawKey);
		return java.util.Base64.getEncoder().encodeToString(result);
	}

	/**
	 * Desifruje text pomoci AES sifry, ktery byl puvodne vracen metodou
	 * aesEncryptBase64. Pouziva metodu: AES/ECB/PKCS5Padding
	 * 
	 * @param base64String Base64 retezec, ktery byl puvodne vracen metodou
	 *                     aesEncryptBase64.
	 * @param password     Heslo, ktere se pouzije pro kodovani.
	 * 
	 * @return Vraci desiforavny text.
	 * 
	 * @throws InvalidKeyException
	 * @throws NoSuchAlgorithmException
	 * @throws NoSuchPaddingException
	 * @throws IllegalBlockSizeException
	 * @throws BadPaddingException
	 * @throws UnsupportedEncodingException
	 * @throws NoSuchProviderException
	 */
	public static String aesDecryptBase64(String base64String, String password)
			throws InvalidKeyException, NoSuchAlgorithmException, NoSuchPaddingException, IllegalBlockSizeException,
			BadPaddingException, UnsupportedEncodingException, NoSuchProviderException {
		byte[] rawKey = getRawKey(password.getBytes("UTF-8"));
		byte[] enc = java.util.Base64.getDecoder().decode(base64String);
		byte[] result = aesDecrypt(enc, rawKey);
		return new String(result, "UTF-8");
	}

	private static byte[] getRawKey(byte[] seed) throws NoSuchAlgorithmException, NoSuchProviderException {
		KeyGenerator kgen = KeyGenerator.getInstance("AES");
		SecureRandom sr = SecureRandom.getInstance("SHA1PRNG", "SUN");
		sr.setSeed(seed);
		kgen.init(128, sr);
		SecretKey skey = kgen.generateKey();
		byte[] raw = skey.getEncoded();
		return raw;
	}

	private static byte[] aesEncrypt(byte[] clear, byte[] raw) throws NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeyException, IllegalBlockSizeException, BadPaddingException {
		SecretKeySpec skeySpec = new SecretKeySpec(raw, "AES");
		Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
		cipher.init(Cipher.ENCRYPT_MODE, skeySpec);
		byte[] encrypted = cipher.doFinal(clear);
		return encrypted;
	}

	private static byte[] aesDecrypt(byte[] encrypted, byte[] raw) throws NoSuchAlgorithmException,
			NoSuchPaddingException, InvalidKeyException, IllegalBlockSizeException, BadPaddingException {
		SecretKeySpec skeySpec = new SecretKeySpec(raw, "AES");
		Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
		cipher.init(Cipher.DECRYPT_MODE, skeySpec);
		byte[] decrypted = cipher.doFinal(encrypted);
		return decrypted;
	}

	/**
	 * Vraci pole bytu z HEX retezce.
	 * 
	 * @param hexString
	 * @return
	 */
	private static byte[] hexToBytes(String hexString) {
		int len = hexString.length() / 2;
		byte[] result = new byte[len];
		for (int i = 0; i < len; i++)
			result[i] = Integer.valueOf(hexString.substring(2 * i, 2 * i + 2), 16).byteValue();
		return result;
	}

	private static String bytesToHex(byte[] b, boolean toLowerCase) {
		char hexDigit[]; 
		if (toLowerCase)
			hexDigit = hchars;
		else
			hexDigit = Hchars;

		StringBuffer buf = new StringBuffer();
		for (int j = 0; j < b.length; j++) {
			buf.append(hexDigit[(b[j] >> 4) & 0x0f]);
			buf.append(hexDigit[b[j] & 0x0f]);
		}
		return buf.toString();
	}

	/*
	function passwordPowerTest(password) {
		var score = 0;	
		if ((password.match(/[a-z]/)) && (password.match(/[A-Z]/))) score++;
		if (password.match(/\d+/)) score++;
		if (password.length < 6) score= 0;
		if (password.length >= 6) score++;
		return score;			
	}
	
	*/
	public static int checkPasswordPower(String password) {
		int score = 0;
		try {
			if (password == null) return 0;
			
			if ((Pattern.compile("[a-z]").matcher(password).find() && Pattern.compile("[A-Z]").matcher(password).find())) score++;
			if (Pattern.compile("\\d+").matcher(password).find()) score++;
			if (Pattern.compile("_|@|-|\\.|\\+").matcher(password).find()) score++;
			if (password.length() < 8)
				score = 0;
			else
				score++;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return score;
	}
}
