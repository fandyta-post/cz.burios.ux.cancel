package cz.burios.ux.cancel.bank.process.cz.b0100.csv;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.lang3.RandomStringUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.math.NumberUtils;
import org.apache.commons.lang3.time.DateUtils;

import cz.burios.ux.cancel.bank.model.BankAccount;
import cz.burios.ux.cancel.bank.model.BankTransaction;
import cz.burios.ux.cancel.bank.model.IBankAccount;
import cz.burios.ux.cancel.bank.model.IBankTransaction;
import cz.burios.ux.uniql.DBContext;

public class BankTransactionFactory_0100 {

	private static Locale locale = new Locale("cs", "CZ");
	private static DecimalFormatSymbols symb = new DecimalFormatSymbols();
	private static DecimalFormat df = new DecimalFormat("############,#0", symb); 

	protected  DBContext db;
	
	public BankTransactionFactory_0100() {
		super();
	}

	public BankTransactionFactory_0100(DBContext db) {
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
				String value = data.get(i);
				switch (i) {
					case 0: {
						// "Datum splatnosti";
						try {
							java.util.Date d = DateUtils.parseDate(value, "dd.MM.yyyy");
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
						// System.out.println("acc: " + acc);
						inst.setRecipientAccountRef(acc);
						// System.out.println("inst.getRecipientAccountRef: " + inst.getRecipientAccountRef());
						break;
					}
					case 3: {	// "Název protiúčtu";
						BankAccount acc = inst.getRecipientAccountRef();
						acc.setName(value);
						break;
					}
					case 4: {	// "Částka";
						try {
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
		}
		return inst;
	}
	
	public DBContext db() {
		return db;
	}
	
	public void db(DBContext db) {
		this.db = db;
	}
	
	protected BankAccount findBankAccountByNumber(String num) {
		BankAccount result = new BankAccount();
		try {
			if (num != null && !num.isBlank()) {			
				String PATTERN = "((\\d{0,6})\\-)?(\\d{6,10})\\/(\\d{4})";
				Pattern p = Pattern.compile(PATTERN);
				Matcher m = p.matcher(num);
				int count = m.groupCount();
				while(m.find()) {
					for (int i = 2; i <= count; i++) {
						switch (i) {
							case 2: result.setPrefix(m.group(i)); break;
							case 3: result.setNumber(m.group(i)); break;
							case 4: result.setBankCode(m.group(i)); break;
						}
					}
				}
				String searchCode = StringUtils.leftPad(num.replaceAll("-", "").replaceAll("/", ""), 30, "0");
				result.setSearchCode(searchCode);
				// System.out.println("searchCode: " + searchCode);
				
				BankAccount ba = db.getDatabase().select(BankAccount.class).where("SEARCH_CODE = '" + result.getSearchCode()+ "'").first();
				if (ba == null) {
					result.setId("BANK-000A-" + RandomStringUtils.random(10, true, true).toUpperCase());
					db.getDatabase().insert(result);
				} else {
					result = ba;				
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		// System.out.println("BankTransactionFactory.findBankAccountByNumber().result: " + result);
		return result;
	}
}
