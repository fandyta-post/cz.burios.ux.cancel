package cz.burios.ux.cancel.bank.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Index;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import cz.burios.ux.core.model.ModulRecord;

@SuppressWarnings("serial")
@Entity(name = "bank_account")
@Table(name = "bank_account", 
	indexes = {
		@Index(name = "bank_account_NAME_idx", columnList = "NAME"),
		@Index(name = "bank_account_ACCOUNT_OWNER_idx", columnList = "ACCOUNT_OWNER"),
		@Index(name = "bank_account_IBAN_idx", columnList = "IBAN"), 
		@Index(name = "bank_account_BIC_idx", columnList = "BIC"),
		@Index(name = "bank_account_COUNTRY_CODE_idx", columnList = "COUNTRY_CODE"),
		@Index(name = "bank_account_BANK_CODE_idx", columnList = "BANK_CODE"),
		@Index(name = "bank_account_SEARCH_CODE_idx", columnList = "SEARCH_CODE"),
		@Index(name = "bank_account_BANK_ID_idx", columnList = "BANK_ID")
	}
)
public class BankAccount extends ModulRecord implements IBankAccount {
	
	@Column(name = "NAME", length = 100, nullable = false)
	private String name = "";
	
	@Column(name = "ACCOUNT_OWNER", length = 20, nullable = false)
	private String accountOwner = "";

	@Column(name = "COUNTRY_CODE", length = 2, nullable = false)
	private String countryCode = "CZ";
	
	@Column(name = "IBAN", length = 30, nullable = true)
	private String iban;
	
	@Column(name = "BIC", length = 11, nullable = true)
	private String bic;
	
	@Column(name = "PREFIX", length = 6, nullable = false)
	private String prefix = "";
	
	@Column(name = "NUMBER", length = 10, nullable = false)
	private String number = "";
	
	@Column(name = "BANK_CODE", length = 4, nullable = false)
	private String bankCode = "";

	@Column(name = "SEARCH_CODE", length = 96, nullable = false)
	private String searchCode = "";

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "BANK_ID", referencedColumnName = "ID")
	private BankInstitution bank = new BankInstitution();

	@Column(name = "ACCOUNT_TYPE", length = 20, nullable = false)
	private String accountType = "";

	/**
	 * 
	 */
	public BankAccount() {}

	/**
	 * 
	 * @param id
	 * @param name
	 * @param iban
	 * @param bic
	 * @param countryCode
	 * @param prefix
	 * @param number
	 * @param bankCode
	 * @param bankId
	 */
	public BankAccount(String id, 
			String name, 
			String iban, 
			String bic, 
			String countryCode, 
			String prefix, 
			String number, 
			String bankCode, 
			String bankId) {
		
		this(id, name, iban, bic, countryCode, prefix, number, bankCode, new BankInstitution(bankId));
	}

	/**
	 * 
	 * @param id
	 * @param name
	 * @param iban
	 * @param bic
	 * @param countryCode
	 * @param prefix
	 * @param number
	 * @param bankCode
	 * @param bankId
	 * @param accountOwner
	 */
	public BankAccount(String id, 
			String name, 
			String iban, 
			String bic, 
			String countryCode, 
			String prefix, 
			String number, 
			String bankCode, 
			String bankId,
			String accountOwner) {
		
		this(id, name, iban, bic, countryCode, prefix, number, bankCode, new BankInstitution(bankId));
		
	}

	/**
	 * 
	 * @param id
	 * @param name
	 * @param iban
	 * @param bic
	 * @param countryCode
	 * @param prefix
	 * @param number
	 * @param bankCode
	 * @param bank
	 */
	public BankAccount(String id, 
			String name, 
			String iban, 
			String bic, 
			String countryCode, 
			String prefix, 
			String number, 
			String bankCode, 
			BankInstitution bank) {
		
		super(id);
		
		this.name = name;
		this.iban = iban;
		this.bic = bic;
		this.countryCode = countryCode;
		this.prefix = prefix;
		this.number = number;
		this.bankCode = bankCode;
		this.bank = bank;
	}

	// -----  ----------------------------------------------------------------

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
	
	public String getAccountOwner() {
		return accountOwner;
	}
	
	public void setAccountOwner(String accountOwner) {
		this.accountOwner = accountOwner;
	}	

	public String getIban() {
		return iban;
	}

	public void setIban(String iban) {
		this.iban = iban;
	}

	public String getBic() {
		return bic;
	}

	public void setBic(String bic) {
		this.bic = bic;
	}

	public String getCountryCode() {
		return countryCode;
	}

	public void setCountryCode(String countryCode) {
		this.countryCode = countryCode;
	}

	public String getPrefix() {
		return prefix;
	}

	public void setPrefix(String prefix) {
		if (prefix == null) {
			prefix = ""; 
		}
		this.prefix = prefix;
	}

	public String getNumber() {
		return number;
	}

	public void setNumber(String number) {
		if (number == null) {
			number = ""; 
		}		
		this.number = number;
	}

	public String getBankCode() {
		return bankCode;
	}

	public void setBankCode(String bankCode) {
		if (bankCode == null) {
			bankCode = ""; 
		}		
		this.bankCode = bankCode;
	}

	public String getSearchCode() {
		return searchCode;
	}

	public void setSearchCode(String searchCode) {
		this.searchCode = searchCode;
	}

	/**
	 * 
	 * @return
	 */
	public BankInstitution getBank() {
		return bank;
	}

	public void setBank(BankInstitution bank) {
		this.bank = bank;
	}

	// -----  -----------------------------------------------------------------
	
	@Override
	protected String getUniqueIdPrefix() {
		return this.uniqueIdPrefix = "BANK-000A";
	}
	
	@Override
	public String toString() {
		return "BankAccount ["
					+ "id=" + getId() + ", "
					+ "name=" + name + ", "
					+ "countryCode=" + countryCode + ", "
					+ "iban=" + iban + ", "
					+ "bic=" + bic + ", "
					+ "prefix=" + prefix + ", "
					+ "number=" + number + ", "
					+ "bankCode=" + bankCode + ", "
					+ "bank=" + bank 
				+ "]";
	}

	public String getAccountType() {
		return accountType;
	}

	public void setAccountType(String accountType) {
		this.accountType = accountType;
	}

}