package cz.burios.ux.cancel.bank.model.cz.b0800;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;

import cz.burios.ux.cancel.bank.model.IBankAccount;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(value = { "secondaryId" })
public class BankAccount_0800 implements IBankAccount {
	
	protected String id;
	protected String name;
	protected String iban;
	protected String bic;
	protected String countryCode;
	protected String prefix;
	protected String number;
	protected String bankCode;

	public BankAccount_0800() {}

	/**
	 * 
	 * @param id - 
	 * @param name - Jmeno vlastanika uctu
	 * @param iban - IBAN banky (mezinárodní kod uctu) 
	 * @param bic - BIC/SWIFT banky (mezinárodní kod banky)
	 * @param countryCode - 3mistny kod zeme Counntry.code3 
	 * @param prefix - prefix cisla uctu [000000]-000000000/0000 
	 * @param number - cisla uctu 000000-[000000000]/0000
	 * @param bankCode - kod banky 000000-000000000/[0000]
	 */
	public BankAccount_0800(
			String id, 
			String name, 
			String iban, 
			String bic, 
			String countryCode, 
			String prefix,
			String number, 
			String bankCode) {
		super();
		this.id = id;
		this.name = name;
		this.iban = iban;
		this.bic = bic;
		this.countryCode = countryCode;
		this.prefix = prefix;
		this.number = number;
		this.bankCode = bankCode;
	}
	
	// -----  ----------------------------------------------------------------

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}
	
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
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
		this.prefix = prefix;
	}

	public String getNumber() {
		return number;
	}

	public void setNumber(String number) {
		this.number = number;
	}

	public String getBankCode() {
		return bankCode;
	}

	public void setBankCode(String bankCode) {
		this.bankCode = bankCode;
	}
	
	// -----  ----------------------------------------------------------------

	@Override
	public String toString() {
		return "BankAccount [id=" + id + ", "
				+ "iban=" + iban + ", "
				+ "bic=" + bic + ", "
				+ "countryCode=" + countryCode + ", "
				+ "prefix=" + prefix + ", "
				+ "number=" + number + ", "
				+ "bankCode=" + bankCode 
				+ "]";
	}

	@Override
	public String getAccountOwner() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void setAccountOwner(String accountOwner) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public String getSearchCode() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void setSearchCode(String searchCode) {
		// TODO Auto-generated method stub
		
	}

}
