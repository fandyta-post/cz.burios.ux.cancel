package cz.burios.ux.cancel.bank.model;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Index;
import javax.persistence.JoinColumn;
import javax.persistence.Lob;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import cz.burios.ux.core.model.ModulRecord;

@SuppressWarnings("serial")
@Entity(name = "bank_transaction")
@Table(name = "bank_transaction", 
	indexes = {
			@Index(name = "bank_transaction_ACCOUNT_idx", columnList = "ACCOUNT"),
			@Index(name = "bank_transaction_VARIABLE_SYMBOL_idx", columnList = "VARIABLE_SYMBOL"),
			@Index(name = "bank_transaction_EXECUTION_DATE_idx", columnList = "EXECUTION_DATE"),
			@Index(name = "bank_transaction_RECIPIENT_ACCOUNT_REF_idx", columnList = "RECIPIENT_ACCOUNT_REF"),
			@Index(name = "bank_transaction_SPECIFIC_SYMBOL_idx", columnList = "SPECIFIC_SYMBOL")
	}
)
public class BankTransaction extends ModulRecord implements IBankTransaction {

	/*
	CREATE TABLE `bank_transaction` (
		`ID` VARCHAR(20) NOT NULL DEFAULT '' COLLATE 'utf8_czech_ci',
		`CREATE_DATE` DATE NULL DEFAULT NULL,
		`UPDATE_DATE` DATE NULL DEFAULT NULL,
		`ACCOUNT` VARCHAR(20) NOT NULL DEFAULT '' COLLATE 'utf8_czech_ci',
		`EXECUTION_DATE` DATETIME NOT NULL DEFAULT '0000-01-01 00:00:00',
		`RECIPIENT_ACCOUNT` VARCHAR(20) NOT NULL DEFAULT '' COLLATE 'utf8_czech_ci',
		`AMOUNT` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
		`VARIABLE_SYMBOL` VARCHAR(15) NOT NULL DEFAULT '' COLLATE 'utf8_czech_ci',
		`CONSTANT_SYMBOL` VARCHAR(15) NOT NULL DEFAULT '' COLLATE 'utf8_czech_ci',
		`SPECIFIC_SYMBOL` VARCHAR(15) NOT NULL DEFAULT '' COLLATE 'utf8_czech_ci',
		`REFERENCE_NUMBER` VARCHAR(200) NOT NULL DEFAULT '' COLLATE 'utf8_czech_ci',
		`NOTE` TINYTEXT NOT NULL COLLATE 'utf8_czech_ci',
		`SENDER_REFERENCE` VARCHAR(100) NOT NULL DEFAULT '' COLLATE 'utf8_czech_ci',
		`RECEIVER_REFERENCE` VARCHAR(100) NOT NULL DEFAULT '' COLLATE 'utf8_czech_ci',
		PRIMARY KEY (`ID`) USING BTREE,
		INDEX `ACCOUNT` (`ACCOUNT`) USING BTREE,
		INDEX `VARIABLE_SYMBOL` (`VARIABLE_SYMBOL`) USING BTREE,
		INDEX `EXECUTION_DATE` (`EXECUTION_DATE`) USING BTREE,
		INDEX `RECIPIENT_ACCOUNT` (`RECIPIENT_ACCOUNT`) USING BTREE,
		INDEX `SPECIFIC_SYMBOL` (`SPECIFIC_SYMBOL`) USING BTREE
	)
	COLLATE='utf8_czech_ci'
	ENGINE=MyISAM
	;	
	 */
	
	// `ACCOUNT` VARCHAR(20) NOT NULL DEFAULT '' COLLATE 'utf8_czech_ci',
	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "ACCOUNT")
	protected BankAccount account;

	// `EXECUTION_DATE` DATETIME NOT NULL DEFAULT '0000-01-01 00:00:00',
	@Column(name = "EXECUTION_DATE", nullable = false)
	protected LocalDate executionDate;
	
	// `RECIPIENT_ACCOUNT` VARCHAR(30) NOT NULL DEFAULT '' COLLATE 'utf8_czech_ci',
	@Column(name = "RECIPIENT_ACCOUNT", length = 30, nullable = false)
	protected String recipientAccount = "";
	
	// `RECIPIENT_ACCOUNT_REF` VARCHAR(30) NOT NULL DEFAULT '' COLLATE 'utf8_czech_ci',
	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "RECIPIENT_ACCOUNT_REF", referencedColumnName = "ID")	
	protected BankAccount recipientAccountRef;
	
	// `AMOUNT` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
	@Column(name = "AMOUNT", precision = 11, scale = 2, nullable = false)
	protected BigDecimal amount = new BigDecimal(0.00).setScale(2, RoundingMode.HALF_UP);

	// `VARIABLE_SYMBOL` VARCHAR(15) NOT NULL DEFAULT '' COLLATE 'utf8_czech_ci',
	@Column(name = "VARIABLE_SYMBOL", length = 15, nullable = false)
	protected String variableSymbol = "";

	// `CONSTANT_SYMBOL` VARCHAR(15) NOT NULL DEFAULT '' COLLATE 'utf8_czech_ci',
	@Column(name = "CONSTANT_SYMBOL", length = 15, nullable = false)
	protected String constantSymbol = "";

	// `SPECIFIC_SYMBOL` VARCHAR(15) NOT NULL DEFAULT '' COLLATE 'utf8_czech_ci',
	@Column(name = "SPECIFIC_SYMBOL", length = 15, nullable = false)
	protected String specificSymbol = "";
	
	// `REFERENCE_NUMBER` VARCHAR(200) NOT NULL DEFAULT '' COLLATE 'utf8_czech_ci',
	@Column(name = "REFERENCE_NUMBER", length = 200, nullable = false)
	protected String referenceNumber = "";
	
	// `SENDER_REFERENCE` VARCHAR(100) NOT NULL DEFAULT '' COLLATE 'utf8_czech_ci',
	@Column(name = "SENDER_REFERENCE", length = 100, nullable = false)
	protected String senderReference = "";

	// `RECEIVER_REFERENCE` VARCHAR(100) NOT NULL DEFAULT '' COLLATE 'utf8_czech_ci',
	@Column(name = "RECEIVER_REFERENCE", nullable = false)
	protected String receiverReference = "";

	// `NOTE` TINYTEXT NOT NULL COLLATE 'utf8_czech_ci',
	@Lob
	@Column(name = "NOTE", nullable = false)
	protected String note = "";
	
	public BankTransaction() {
		this.uniqueIdPrefix = "BANK-000T";
	}
	
	// ----- standard getters, setters -----

	public BankTransaction(
			String id,
			String account, 
			LocalDate executionDate, 
			String recipientAccount, 
			BigDecimal amount,
			String variableSymbol, 
			String constantSymbol, 
			String specificSymbol, 
			String referenceNumber,
			String senderReference, 
			String receiverReference, 
			String note) {
		
		this(id, 
			new BankAccount(), 
			executionDate, 
			recipientAccount,
			new BankAccount(),
			amount, 
			variableSymbol, 
			constantSymbol, 
			specificSymbol, 
			referenceNumber, 
			senderReference, 
			receiverReference, 
			note);
		
		getAccount().setId(account);
	}

	public BankTransaction(
			String id,
			IBankAccount account, 
			LocalDate executionDate, 
			String recipientAccount,
			IBankAccount recipientAccountRef,
			BigDecimal amount,
			String variableSymbol, 
			String constantSymbol, 
			String specificSymbol, 
			String referenceNumber,
			String senderReference, 
			String receiverReference, 
			String note) {
		super();
		
		setId(id);
		setCreatedAt(LocalDateTime.now());
		setUpdatedAt(LocalDateTime.now());
		
		this.uniqueIdPrefix = "BANK-000T";
		this.account = (BankAccount) account;
		
		this.executionDate = executionDate;
		this.recipientAccount = recipientAccount;
		this.amount = amount;
		this.variableSymbol = variableSymbol;
		this.constantSymbol = constantSymbol;
		this.specificSymbol = specificSymbol;
		this.referenceNumber = referenceNumber;
		this.senderReference = senderReference;
		this.receiverReference = receiverReference;
		this.note = note;
	}

	@Override
	public BankAccount getAccount() {
		return account;
	}
	
	@Override
	public void setAccount(BankAccount account) {
		this.account = (BankAccount) account;
	}
	
	@Override
	public LocalDate getExecutionDate() {
		// return java.sql.Date.valueOf(executionDate);
		return executionDate;
	}
	
	/**
	 * 
	 * @param executionDate
	 */
	@Override
	public void setExecutionDate(LocalDate executionDate) {
		this.executionDate = executionDate;
	}
	
	public void setExecutionDate(Date date) {
		executionDate = date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
	}

	/**
	 * 
	 * @return
	 */
	public String getRecipientAccount() {
		return recipientAccount;
	}

	/**
	 * 
	 * @param recipientAccount
	 */
	public void setRecipientAccount(String recipientAccount) {
		this.recipientAccount = recipientAccount;
	}
	
	@Override
	public BankAccount getRecipientAccountRef() {
		return recipientAccountRef;
	}
	
	@Override
	public void setRecipientAccountRef(BankAccount recipientAccountRef) {
		this.recipientAccountRef = (BankAccount) recipientAccountRef;
	}

	/**
	 * 
	 * @return
	 */
	public BigDecimal getAmount() {
		return amount;
	}

	/**
	 * 
	 * @param amount
	 */
	public void setAmount(BigDecimal amount) {
		this.amount = amount;
	}

	/**
	 * 
	 * @return
	 */
	public String getVariableSymbol() {
		return variableSymbol;
	}

	/**
	 * 
	 * @param variableSymbol
	 */
	public void setVariableSymbol(String variableSymbol) {
		this.variableSymbol = variableSymbol;
	}

	/**
	 * 
	 * @return
	 */
	public String getConstantSymbol() {
		return constantSymbol;
	}

	/**
	 * 
	 * @param constantSymbol
	 */
	public void setConstantSymbol(String constantSymbol) {
		this.constantSymbol = constantSymbol;
	}

	/**
	 * 
	 * @return
	 */
	public String getSpecificSymbol() {
		return specificSymbol;
	}

	/**
	 * 
	 * @param specificSymbol
	 */
	public void setSpecificSymbol(String specificSymbol) {
		this.specificSymbol = specificSymbol;
	}

	/**
	 * 
	 * @return
	 */
	public String getReferenceNumber() {
		return referenceNumber;
	}

	/**
	 * 
	 * @param referenceNumber
	 */
	public void setReferenceNumber(String referenceNumber) {
		this.referenceNumber = referenceNumber;
	}

	/**
	 * 
	 * @return
	 */
	public String getSenderReference() {
		return senderReference;
	}

	/**
	 * 
	 * @param senderReference
	 */
	public void setSenderReference(String senderReference) {
		this.senderReference = senderReference;
	}

	/**
	 * 
	 * @return
	 */
	public String getReceiverReference() {
		return receiverReference;
	}

	/**
	 * 
	 * @param receiverReference
	 */
	public void setReceiverReference(String receiverReference) {
		this.receiverReference = receiverReference;
	}

	/**
	 * 
	 * @return
	 */
	public String getNote() {
		return note;
	}

	/**
	 * 
	 * @param note
	 */
	public void setNote(String note) {
		this.note = note;
	}

	@Override
	public String getReference() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void setReference(String reference) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public String getValuation() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void setValuation(String valuation) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public String getPartnerName() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void setPartnerName(String partnerName) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public String[] getCategories() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void setCategories(String[] categories) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public String getFavorite() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void setFavorite(String favorite) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public String getReceiverAddress() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void setReceiverAddress(String receiverAddress) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public String getReceiverName() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void setReceiverName(String receiverName) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public String getReceiverModeReference() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void setReceiverModeReference(String receiverModeReference) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public String getSenderAddress() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void setSenderAddress(String senderAddress) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public String getSenderModeReference() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void setSenderModeReference(String senderModeReference) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public String getSenderOriginator() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void setSenderOriginator(String senderOriginator) {
		// TODO Auto-generated method stub
		
	}

	// -----  -----------------------------------------------------------------
	
	@Override
	protected String getUniqueIdPrefix() {
		return this.uniqueIdPrefix = "BANK-000T";
	}

	@Override
	public String toString() {
		return "BankTransaction ["
					+ "id=" + getId() + ", "
					+ "account=" + account + ", "
					+ "executionDate=" + executionDate + ", "
					+ "recipientAccount=" + recipientAccount + ", "
					+ "recipientAccountRef=" + recipientAccountRef + ", "
					+ "amount=" + amount + ", "
					+ "variableSymbol=" + variableSymbol + ", "
					+ "constantSymbol=" + constantSymbol + ", "
					+ "specificSymbol="	+ specificSymbol + ", "
					+ "referenceNumber=" + referenceNumber + ", "
					+ "senderReference=" + senderReference + ", "
					+ "receiverReference=" + receiverReference + ", "
					+ "note=" + note 
				+ "]";
	}	
}
