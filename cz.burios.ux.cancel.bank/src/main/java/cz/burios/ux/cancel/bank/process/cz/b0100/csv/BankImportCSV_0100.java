package cz.burios.ux.cancel.bank.process.cz.b0100.csv;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import org.apache.commons.lang3.RandomStringUtils;

import com.opencsv.CSVParser;
import com.opencsv.CSVParserBuilder;
import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;

import cz.burios.ux.cancel.bank.model.BankAccount;
import cz.burios.ux.cancel.bank.model.BankTransaction;
import cz.burios.ux.core.model.UserContext;
import cz.burios.ux.uniql.DBContext;

public class BankImportCSV_0100 {

	protected DBContext db;
	protected InputStream is;
	protected BankAccount account;
	protected UserContext userCtx;
	
	public BankImportCSV_0100(BankAccount account, InputStream is, DBContext db) {
		this.is = is;
		this.db = db;
		this.account = account;
	}
	
	public void execute() {
		try {
			try (Reader targetReader = new InputStreamReader(is, "Cp1250");) {
				CSVParser parser = new CSVParserBuilder()
						.withSeparator(';')
						.build();
				
				CSVReader csvReader = new CSVReaderBuilder(targetReader).withCSVParser(parser).build();
				
				BankTransactionFactory_0100 factory = new BankTransactionFactory_0100(db);
				
				List<String[]> data = csvReader.readAll();
				boolean start = false;
				for (String[] as : data) {
					List<String> row = Arrays.asList(as);
					if (start) {
						BankTransaction transaction = (BankTransaction) factory.buildBankTransaction(row);
						transaction.setAccount(account);
						String number = transaction.getReferenceNumber();	
						// System.out.println("number: " + number);
						
						BankTransaction bt = db.getDatabase().select(BankTransaction.class).where("REFERENCE_NUMBER = '" + number + "'").first();
						if (bt == null) {
							transaction.setId("BANK-000T-" + RandomStringUtils.random(10, true, true).toUpperCase());
							transaction.setCreatedAt(LocalDateTime.now());
							transaction.setUpdatedAt(LocalDateTime.now());
							System.out.println("insert.transaction.RecipientAccountRef: " + transaction.getRecipientAccountRef());
							db.getDatabase().insert(transaction);
						}						
					}
					/*
					 */
					if (row.size() > 0 && row.get(0).equals("Datum splatnosti")) {
						start = true;
					}
				}
			}			
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
}
