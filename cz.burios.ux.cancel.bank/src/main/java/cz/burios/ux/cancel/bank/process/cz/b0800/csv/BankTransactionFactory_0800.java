package cz.burios.ux.cancel.bank.process.cz.b0800.csv;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.time.DateUtils;

import cz.burios.ux.cancel.bank.model.BankAccount;
import cz.burios.ux.cancel.bank.model.BankTransaction;
import cz.burios.ux.cancel.bank.model.IBankTransaction;
import cz.burios.ux.core.model.UserAccount;
import cz.burios.ux.uniql.DBContext;

public class BankTransactionFactory_0800 {

	private static Locale locale = new Locale("cs", "CZ");
	private static DecimalFormatSymbols symb = new DecimalFormatSymbols();
	private static DecimalFormat df = new DecimalFormat("############,#0", symb); 

	protected DBContext db;
	protected List<String> columnIdentifiers;

	public BankTransactionFactory_0800() {
		super();
	}

	public BankTransactionFactory_0800(DBContext db) {
		super();
		this.db = db;
	}

	public IBankTransaction buildBankTransaction(Object src) {
		BankTransaction inst = null;
		if (src instanceof List) {
			inst = new BankTransaction();
			
			@SuppressWarnings("unchecked")
			List<String> data = (List<String>) src;
			
			for (int i = 0; i < data.size(); i++) {
				String columnIdent = getColumnIdentifiers().get(i);
				String value = data.get(i);
				//System.out.println("columnIdent: " + columnIdent + ", value: " + value);
				switch (columnIdent) {
					// executionDate, value: 16.12.2020
					case "executionDate": {
						try {
							java.util.Date d = DateUtils.parseDate(value, "dd.MM.yyyy", "yyyy/MM/dd");
							inst.setExecutionDate(d);
						} catch (Exception e) {
							System.out.println("value: " + value);
							e.printStackTrace();
						}						
						break;
					}
					// recipientAccountName, value: Dytrychová Adéla
					case "recipientAccountName": {
						BankAccount recipientAccount = inst.getRecipientAccountRef();
						if (recipientAccount == null) {
							recipientAccount = new BankAccount();
							inst.setRecipientAccountRef(recipientAccount);
						}
						recipientAccount.setName(value);
						break;
					}
					// iban, value: CZ2708000000002255696133
					case "iban": {
						BankAccount recipientAccount = inst.getRecipientAccountRef();
						if (recipientAccount == null) {
							recipientAccount = new BankAccount();
							inst.setRecipientAccountRef(recipientAccount);
						}
						recipientAccount.setIban(value);					
						break;
					}
					// recipientAccountNumber, value: 2255696133/0800
					case "recipientAccountNumber": { 
						inst.setRecipientAccount(value.matches(BANK_ACCOUNT_NUMBER_PATTERN) ? value : "");
						BankAccount acc = findBankAccountByNumber(value);
						BankAccount recipientAccount = inst.getRecipientAccountRef();
						if (recipientAccount == null) {
							recipientAccount = new BankAccount();
						}					
						acc.setIban(recipientAccount.getIban());
						acc.setName(recipientAccount.getName());
						inst.setRecipientAccountRef(acc);
						break;
					}
					// recipientAccountBankCode, value: 0800
					case "recipientAccountBankCode": {
						
						break;
					}
					// amount, value: -2 500,00
					case "amount": {
						try {
							BigDecimal bd = new BigDecimal(df.parse(value).doubleValue());
							inst.setAmount(bd);
						} catch (Exception e) {
							System.out.println("ERROR: " + value);
							e.printStackTrace();
						}
						break;
					}
					// currencyCode, value: CZK
					case "currencyCode": {
						
						break;
					}
					// variableSymbol, value: 
					case "variableSymbol": {
						inst.setVariableSymbol(value);
						break;
					}
					// constantSymbol, value: 
					case "constantSymbol": {
						inst.setConstantSymbol(value);
						break;
					}
					// specificSymbol, value: 
					case "specificSymbol": {
						inst.setSpecificSymbol(value);
						break;
					}
					// transactionType, value: Tuzemská odchozí úhrada
					case "transactionType": {
						
						break;
					}
					// senderReference, value: Stravenky
					case "senderReference": {
						inst.setSenderReference(value);
						break;
					}
					// receiverReference, value: Stravenky
					case "receiverReference": {
						inst.setReceiverReference(value);
						break;
					}
					// note, value: 
					case "note": {
						inst.setNote(value);
						break;
					}
					// categories, value: Nezatříděné výdaje
					case "categories": {
						
						break;
					}
					// referenceNumber, value: R5R05PJFY6B
					case "referenceNumber": {
						inst.setReferenceNumber(value); 
						break;
					}
					// cardNumber, value: 
					case "cardNumber": {
						// inst.setcar
						break;
					}
					// cardLocation, value: 
					case "cardLocation": {
						
						break;
					}
					// senderAddress, value: 
					case "senderAddress": {
						
						break;
					}
					// receiverAddress, value: 
					case "receiverAddress": {
						
						break;
					}
					// reference, value: 
					case "reference": {
						inst.setReference(value);
						break;
					}
					// virtualCardNumber, value: 
					case "virtualCardNumber": {
						
						break;
					}
					// virtualCardDeviceName, value: 
					case "virtualCardDeviceName": {
						
						break;
					}
				}
			}
			System.out.println("-----  -----");
			/*
			for (int i = 0; i < data.size(); i++) {
				String value = data.get(i);
				switch (i) {
					case 0: {
						// "Datum splatnosti";
						try {
				: 			java.util.Date d = DateUtils.parseDate(value, "dd.MM.yyyy");
							inst.setExecutionDate(d);
						} catch (Exception e) {
							System.out.println("value: " + value);
							e.printStackTrace();
						}
						break;
					}
					case 1: {	// "Datum odepsání z jiné banky";
						break;
					}
					case 2: {	// "Protiúčet a kód banky";
						inst.setRecipientAccount(value);
						BankAccount acc = findBankAccountByNumber(value);
						System.out.println("acc: " + acc);
						inst.setRecipientAccountRef(acc);
						System.out.println("inst.getRecipientAccountRef: " + inst.getRecipientAccountRef());
						break;
					}
					case 3: {	// "Název protiúčtu";
						IBankAccount acc = inst.getRecipientAccountRef();
						acc.setName(value);
						break;
					}
					case 4: {	// "Částka";
						try {
							System.out.println("Amount: " + value);
							BigDecimal bd = new BigDecimal(df.parse(value).doubleValue());
							inst.setAmount(bd);
						} catch (Exception e) {
							System.out.println("ERROR: " + value);
							e.printStackTrace();
						}
						break;
					}
					case 5: {	// "Originální částka";
						break;
					}
					case 6: {	// "Originální měna";
						break;
					}
					case 7: {	// "Kurz";
						break;
					}
					case 8: {	// "VS";
						inst.setVariableSymbol(value); break;
					}
					case 9: {	// "KS";
						inst.setConstantSymbol(value); break;
					}
					case 10: {	// "SS";
						inst.setSpecificSymbol(value); break;
					}
					case 11: { 	// "Identifikace transakce";
						inst.setReferenceNumber(value); break;
					}
					case 12: { 	// "Systémový popis";
						inst.getNote();
						break;
					}
					case 13: { 	// "Popis příkazce";
						inst.setSenderReference(value);	break;
					}
					case 14: { 	// "Popis pro příjemce";
						inst.setReceiverReference(value); break;
					}
					case 15: 	// "AV pole 1";
					case 16: 	// "AV pole 2";
					case 17: 	// "AV pole 3";
					case 18: 	// "AV pole 4";
						break;
				}
			}
			*/
		}
		return inst;
	}

	private IBankTransaction buildBy2018(Object src) {
		IBankTransaction transaction = new BankTransaction();
		return transaction;
	}
	
	// ----- Getter & Setter  -------------------------------------------------
	
	public DBContext db() {
		return db;
	}
	
	public void db(DBContext db) {
		this.db = db;
	}
	
	public List<String> getColumnIdentifiers() {
		return columnIdentifiers;
	}
	
	public void setColumnIdentifiers(List<String> columnIdentifiers) {
		this.columnIdentifiers = columnIdentifiers;
	}
	
	private static String BANK_ACCOUNT_NUMBER_PATTERN = "((\\d{0,6})\\-)?(\\d{6,10})/(\\d{4})";	
	
	protected BankAccount findBankAccountByNumber(String num) {
		BankAccount result = new BankAccount();
		try {
			System.out.println("BankTransactionFactory_0800.findBankAccountByNumber().num: " + num);
			if (num != null && !num.isBlank()) {			
				Pattern p = Pattern.compile(BANK_ACCOUNT_NUMBER_PATTERN);
				Matcher m = p.matcher(num);
				if (m.matches()) {
					int count = m.groupCount();
					//while (m.find()) {
					if (count >= 4) {
						for (int i = 2; i <= count; i++) {
							switch (i) {
							case 2:
								result.setPrefix(m.group(i));
								break;
							case 3:
								result.setNumber(m.group(i));
								break;
							case 4:
								result.setBankCode(m.group(i));
								break;
							}
						}
					}
					String searchCode = StringUtils.leftPad(num.replaceAll("-", "").replaceAll("/", ""), 30, "0");
					result.setSearchCode(searchCode);
					// System.out.println("searchCode: " + searchCode);

					BankAccount ba = db.getDatabase().select(BankAccount.class).where("SEARCH_CODE = '" + result.getSearchCode() + "'").first();
					if (ba == null) {
						LocalDateTime now = LocalDateTime.now();
						
						result.createId();
						result.setCreatedAt(now);
						result.setCreatedUser(new UserAccount(""));
						result.setUpdatedAt(now);
						result.setUpdatedUser(new UserAccount(""));
						
						db.getDatabase().insert(result);
					} else {
						result = ba;
					}
				} else {
					result = new BankAccount("", "", "", "", "", "", "", "", "", "");
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		// System.out.println("BankTransactionFactory.findBankAccountByNumber().result: " + result);
		return result;
	}	
}