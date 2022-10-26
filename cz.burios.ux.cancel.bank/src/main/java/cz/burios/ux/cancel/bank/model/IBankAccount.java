package cz.burios.ux.cancel.bank.model;

public interface IBankAccount {

	public String getId();
	
	public void setId(String id);
	
	public String getName();

	public void setName(String name);

	public String getAccountOwner();
	
	public void setAccountOwner(String accountOwner);

	public String getIban();

	public void setIban(String iban);

	public String getBic();

	public void setBic(String bic);

	public String getCountryCode();

	public void setCountryCode(String countryCode);

	public String getPrefix();

	public void setPrefix(String prefix);

	public String getNumber();

	public void setNumber(String number);

	public String getBankCode();

	public void setBankCode(String bankCode);

	public String getSearchCode();

	public void setSearchCode(String searchCode);
}