package cz.burios.ux.cancel.bank.process.cz.b0800.csv;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import org.apache.commons.collections4.MultiValuedMap;
import org.apache.commons.collections4.multimap.ArrayListValuedHashMap;
import org.apache.commons.lang3.RandomStringUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.time.DateFormatUtils;

import com.opencsv.CSVParser;
import com.opencsv.CSVParserBuilder;
import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;

import cz.burios.ux.cancel.bank.model.BankAccount;
import cz.burios.ux.cancel.bank.model.BankTransaction;
import cz.burios.ux.core.model.UserAccount;
import cz.burios.ux.uniql.DBContext;

public class BankImportCSV_0800 {

	protected char delimiter = ';';
	protected String pageCode = "Cp1250";
	protected DBContext db;
	protected InputStream is;
	protected BankAccount account;
	
	public BankImportCSV_0800(InputStream is, DBContext db) {
		this.is = is;
		this.db = db;
	}
	
	public void execute() {
		try {
			try (Reader targetReader = new InputStreamReader(is, pageCode);) {
				CSVParser parser = new CSVParserBuilder().withSeparator(delimiter).build();
				CSVReader csvReader = new CSVReaderBuilder(targetReader).withCSVParser(parser).build();
				
				BankTransactionFactory_0800 factory = new BankTransactionFactory_0800(db);
				UserAccount user = new UserAccount("");
				
				List<String[]> data = csvReader.readAll();
				List<String> row = Arrays.asList(data.get(0));
				System.out.println("row: " + row);

				List<String> columnIdentifiers = makeColumnIdentifiers(row);
				System.out.println("columnIdentifiers: " + columnIdentifiers);
				factory.setColumnIdentifiers(columnIdentifiers);
				
				boolean start = false;
				for (String[] as : data) {
					row = Arrays.asList(as);
					if (start) {
						BankTransaction transaction = (BankTransaction) factory.buildBankTransaction(row);
						transaction.setAccount(account);
						System.out.println("transaction: " + transaction);
						String number = transaction.getReferenceNumber();	
						System.out.println("number: " + number);
						/*
						if (number == null || number.isBlank()) {
							number = "UNKNOWN_ITEM";
						}
						 */
						if (number == null || number.isBlank()) {
							LocalDate executionDate = transaction.getExecutionDate();
							String dt = DateFormatUtils.format(java.sql.Date.valueOf(executionDate), "yyyyMMdd");
							String amount = StringUtils.leftPad("" + transaction.getAmount().multiply(new BigDecimal(100)), 10, "0") ;
							String name = transaction.getRecipientAccountRef().getName();
							System.out.println("dt: " + dt + ", amount: " + amount + ", name: (" + name + ")");
							number = "" + dt + amount + name;
							System.out.println("number(1): " + number);
							number = Base64.getEncoder().encodeToString(number.getBytes()).toUpperCase();
						}
						System.out.println("number(2): " + number);
						BankTransaction bt = db.getDatabase().select(BankTransaction.class).where("REFERENCE_NUMBER = '" + number + "'").first();
						if (bt == null) {
							LocalDateTime now = LocalDateTime.now();
							transaction.createId();
							transaction.setCreatedAt(now);
							transaction.setUpdatedAt(now);
							if (transaction.getSenderReference() == null) {
								transaction.setSenderReference("");
							}
							if (transaction.getRecipientAccount() == null) {
								transaction.setRecipientAccount("");	
							}
							transaction.setCreatedUser(user);
							transaction.setUpdatedUser(user);
							transaction.setReferenceNumber(number);
							db.getDatabase().insert(transaction);
						}						
						/*
						 */
					}
					start = true;
				}
				/*
				 */
			}			
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	// registerColumnIdentifiers
	Map<String, String> registerColumnIdentifiers = new TreeMap<>(); {
		// registerColumnIdentifiers.put("", "");

		// 2015
		// registerColumnIdentifiers.put("Polo??ka", "");						 				//  0 - v2015
		// registerColumnIdentifiers.put("Datum za????tov??n??", "");								//  0 - v2015
		// registerColumnIdentifiers.put("????stka CZK", "");										//  0 - v2015
		// registerColumnIdentifiers.put("Bankovn?? spojen??", "");								//  0 - v2015
		registerColumnIdentifiers.put("Datum proveden??", "executionDate");						//  0 - v2015
		// registerColumnIdentifiers.put("Variabiln?? symbol 1", "");							//  0 - v2015
		// registerColumnIdentifiers.put("Storno", "");											//  0 - v2015
		// registerColumnIdentifiers.put("N??zev proti????tu", "");								//  0 - v2015
		// registerColumnIdentifiers.put("Konstantn?? symbol", "");								//  0 - v2015
		// registerColumnIdentifiers.put("Specifick?? symbol", "");								//  0 - v2015
		// registerColumnIdentifiers.put("Zpr??va pro p????jemce", "");							//  0 - v2015
		// registerColumnIdentifiers.put("Zpr??va pro m??", "");									//  0 - v2015
		// registerColumnIdentifiers.put("Referen??n?? ????slo transakce", "");						//  0 - v2015
		// registerColumnIdentifiers.put("Klientsk?? pozn??mka", "");								//  0 - v2015
		// registerColumnIdentifiers.put("Reference platby", "");								//  0 - v2015
		registerColumnIdentifiers.put("D??vod neproveden??", "");									//  0 - v2015

		// 2008 - 2010
		registerColumnIdentifiers.put("Polo??ka", "senderReference"); 							//  0 - v2008 
		registerColumnIdentifiers.put("Valuta za????t.",  "");			 						//  1 - v2008
		registerColumnIdentifiers.put("Var.symb.2", ""); 										//  2 - v2008 
		registerColumnIdentifiers.put("????stka CZK", "amount"); 									//  3 - v2008 
		registerColumnIdentifiers.put("Bankovn?? spojen??", "recipientAccountNumber"); 			//  4 - v2008
		registerColumnIdentifiers.put("Dat.zprac.", "executionDate");							//  5 - v2008 
		registerColumnIdentifiers.put("Var.symb.1", "variableSymbol");							//  6 - v2008 
		registerColumnIdentifiers.put("Storno", ""); 											//  7 - v2008 
		registerColumnIdentifiers.put("N??zev proti????tu", "recipientAccountName"); 				//  8 - v2008 
		registerColumnIdentifiers.put("Konst.symb.", "constantSymbol");							//  9 - v2008
		registerColumnIdentifiers.put("Spec.symb.", "specificSymbol");							// 10 - v2008 
		registerColumnIdentifiers.put("Zpr??va pro p????jemce", "receiverReference");				// 11 - v2008 
		registerColumnIdentifiers.put("Referen??n?? ????slo", "referenceNumber");					// 12 - v2008

		// 2011
		registerColumnIdentifiers.put("Polo??ka",  "");						 					//  0 - v2011
		registerColumnIdentifiers.put("Valuta za????tov??na",  "");			 					//  1 - v2011
		registerColumnIdentifiers.put("Variabiln?? symbol 2",  "");			 					//  2 - v2011
		// registerColumnIdentifiers.put("????stka CZK",  "");				 					//  3 - v2011
		// registerColumnIdentifiers.put("Bankovn?? spojen??",  "");								//  4 - v2011
		registerColumnIdentifiers.put("Datum zpracov??n??",  "executionDate"); 					//  5 - v2011
		registerColumnIdentifiers.put("Variabiln?? symbol 1",  "variableSymbol");				//  6 - v2011
		// registerColumnIdentifiers.put("Storno", "");						 					//  7 - v2011
		// registerColumnIdentifiers.put("N??zev proti????tu",  ""); 				 				//  8 - v2011
		// registerColumnIdentifiers.put("Konstantn?? symbol",  ""); 			 				//  9 - v2011
		// registerColumnIdentifiers.put("Specifick?? symbol",  "");			 					// 10 - v2011
		// registerColumnIdentifiers.put("Zpr??va pro p????jemce",  ""); 			 				// 11 - v2011
		registerColumnIdentifiers.put("Zpr??va pro p????kazce",  "senderReference");				// 12 - v2011
		registerColumnIdentifiers.put("Referen??n?? ????slo transakce",  "referenceNumber");		// 13 - v2011
		
		// 2012
		// registerColumnIdentifiers.put("Typ transakce",  ""); 								//  0 - v2012 
		// registerColumnIdentifiers.put("Datum za????tov??n??",  "");								//  1 - v2012 
		// registerColumnIdentifiers.put("Variabiln?? symbol 2",  ""); 							//  2 - v2012
		// registerColumnIdentifiers.put("????stka CZK",  "");									//  3 - v2012
		// registerColumnIdentifiers.put("Bankovn?? spojen??",  ""); 								//  4 - v2012
		// registerColumnIdentifiers.put("Datum zpracov??n??",  ""); 								//  5 - v2012
		// registerColumnIdentifiers.put("Variabiln?? symbol 1",  "");							//  6 - v2012
		// registerColumnIdentifiers.put("Storno",  ""); 										//  7 - v2012
		// registerColumnIdentifiers.put("N??zev proti????tu",  ""); 								//  8 - v2012
		// registerColumnIdentifiers.put("Konstantn?? symbol",  ""); 							//  9 - v2012
		// registerColumnIdentifiers.put("Specifick?? symbol",  "");								// 10 - v2012
		// registerColumnIdentifiers.put("Zpr??va pro p????jemce",  ""); 							// 11 - v2012
		// registerColumnIdentifiers.put("Zpr??va pro m??",  ""); 								// 12 - v2012
		// registerColumnIdentifiers.put("Referen??n?? ????slo transakce",  ""); 					// 13 - v2012
		registerColumnIdentifiers.put("Klientsk?? pozn??mka", "note");							// 14 - v2012

		// 2013 - 2014 
		// registerColumnIdentifiers.put("Polo??ka", ""); 							//  0 - v2032
		// registerColumnIdentifiers.put("Datum za????tov??n??", "");					//  1 - v2032
		// registerColumnIdentifiers.put("????stka CZK", "");							//  2 - v2032
		// registerColumnIdentifiers.put("Bankovn?? spojen??", "");					//  3 - v2032
		// registerColumnIdentifiers.put("Datum zpracov??n??", "");					//  4 - v2032
		// registerColumnIdentifiers.put("Variabiln?? symbol 1", "");				//  5 - v2032
		// registerColumnIdentifiers.put("Storno", "");								//  6 - v2032
		// registerColumnIdentifiers.put("N??zev proti????tu", "");					//  7 - v2032
		// registerColumnIdentifiers.put("Konstantn?? symbol", "");					//  8 - v2032
		// registerColumnIdentifiers.put("Specifick?? symbol", "");					//  9 - v2032
		// registerColumnIdentifiers.put("Zpr??va pro p????jemce", ""); 				// 10 - v2032
		// registerColumnIdentifiers.put("Zpr??va pro m??", "");						// 11 - v2032
		// registerColumnIdentifiers.put("Referen??n?? ????slo transakce", "");			// 12 - v2032
		// registerColumnIdentifiers.put("Klientsk?? pozn??mka" "");					// 13 - v2032
		
		// -----  -------------------------------------------------------------
		
		// 2018 - 2021
		registerColumnIdentifiers.put("Datum za????tov??n??", "executionDate"); 					//  0 - v2021
		registerColumnIdentifiers.put("N??zev proti????tu", "recipientAccountName");				//  1 - v2021
		registerColumnIdentifiers.put("IBAN", "iban"); 											//  2 - v2021
		registerColumnIdentifiers.put("Proti????et", "recipientAccountNumber"); 					//  3 - v2021
		registerColumnIdentifiers.put("Bankovn?? k??d proti????tu", "recipientAccountBankCode"); 	//  4 - v2021
		registerColumnIdentifiers.put("????stka", "amount");										//  5 - v2021
		registerColumnIdentifiers.put("M??na", "currencyCode");									//  6 - v2021
		registerColumnIdentifiers.put("Konstantn?? symbol", "constantSymbol"); 					//  7 - v2021
		registerColumnIdentifiers.put("Specifick?? symbol", "specificSymbol");					//  8 - v2021
		registerColumnIdentifiers.put("Variabiln?? symbol", "variableSymbol");					//  9 - v2021
		registerColumnIdentifiers.put("Typ transakce", "transactionType");						// 10 - v2021
		registerColumnIdentifiers.put("Zpr??va pro m??", "senderReference");						// 11 - v2021
		registerColumnIdentifiers.put("Zpr??va pro p????jemce", "receiverReference"); 				// 12 - v2021
		registerColumnIdentifiers.put("Pozn??mka", "note");										// 13 - v2021
		registerColumnIdentifiers.put("Kategorie", "categories");								// 14 - v2021
		registerColumnIdentifiers.put("ID transakce", "referenceNumber");						// 15 - v2021
		registerColumnIdentifiers.put("????slo karty", "cardNumber");								// 16 - v2021
		registerColumnIdentifiers.put("M??sto pou??it?? karty", "cardLocation"); 					// 17 - v2021
		registerColumnIdentifiers.put("N??zev investi??n??ho n??stroje", ""); 						// 18 - v2021
		registerColumnIdentifiers.put("Adresa pl??tce", "senderAddress");							// 19 - v2021
		registerColumnIdentifiers.put("Adresa p????jemce", "receiverAddress");	 					// 20 - v2021
		registerColumnIdentifiers.put("Reference platby", "reference");							// 21 - v2021
		registerColumnIdentifiers.put("????slo virtu??ln?? karty", "virtualCardNumber");				// 22 - v2021
		registerColumnIdentifiers.put("N??zev za????zen??", "virtualCardDeviceName");				// 23 - v2021
		registerColumnIdentifiers.put("N??zev p????kazu/souhlasu", "");								// 24 - v2021
	}
	
	private List<String> makeColumnIdentifiers(List<String> row) {
		List<String> columnIdentifiers = new ArrayList<String>();
		for (String key : row) {
			String name = registerColumnIdentifiers.getOrDefault(key, "");
			columnIdentifiers.add(name);
		}
		return columnIdentifiers;
	}
	
	/*
	

	List<String> v2015 = Arrays.asList(
		"Polo??ka", "Datum za????tov??n??", "????stka CZK", "Bankovn?? spojen??",
		"Datum proveden??", "Variabiln?? symbol 1", "Storno", "N??zev proti????tu",
		"Konstantn?? symbol", "Specifick?? symbol", "Zpr??va pro p????jemce",
		"Zpr??va pro m??", "Referen??n?? ????slo transakce", "Klientsk?? pozn??mka",
		"Reference platby", "D??vod neproveden??" 			
	);
	
	
	public String getColumnsByFiscal(List<String> headerRow) {
		int sz = headerRow.size();
		List<String> keys = sizing.get(sz); 
		for (String key : keys) {
			List<String> h = tmps.get(key);
			if (h != null && headerRow.equals(h)) {
				return key;
			}
		}
		return "v2018";
	}
	
	 */
	
	// -----  -----------------------------------------------------------------
	
	public char getDelimiter() {
		return delimiter;
	}
	
	public BankImportCSV_0800 setDelimiter(char delimiter) {
		this.delimiter = delimiter;
		return this;
	}
	
	public String getPageCode() {
		return pageCode;
	}
	
	public BankImportCSV_0800 setPageCode(String pageCode) {
		this.pageCode = pageCode;
		return this;
	}
	
	public BankAccount getAccount() {
		return account;
	}
	
	public BankImportCSV_0800 setAccount(BankAccount account) {
		this.account = account;
		return this;
	}
}

