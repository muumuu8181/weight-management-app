import os

class Customer:
    def __init__(self, customer_id, name, email):
        self.customer_id = customer_id
        self.name = name
        self.email = email

class CustomerManager:
    def __init__(self):
        self.customers = {}

    def add_customer(self, customer_id, name, email):
        if customer_id in self.customers:
            print("Customer ID already exists.")
            return
        self.customers[customer_id] = Customer(customer_id, name, email)
        print("Customer added successfully.")

    def view_customer(self, customer_id):
        customer = self.customers.get(customer_id)
        if not customer:
            print("Customer not found.")
            return
        print("Customer ID:", customer.customer_id)
        print("Name:", customer.name)
        print("Email:", customer.email)

    def view_all_customers(self):
        if not self.customers:
            print("No customers to display.")
            return
        for customer in self.customers.values():
            print("--------------------")
            print("Customer ID:", customer.customer_id)
            print("Name:", customer.name)
            print("Email:", customer.email)
            print("--------------------")

    def delete_customer(self, customer_id):
        if customer_id not in self.customers:
            print("Customer not found.")
            return
        del self.customers[customer_id]
        print("Customer deleted successfully.")

def clear_console():
    os.system('cls' if os.name == 'nt' else 'clear')

def main():
    manager = CustomerManager()

    while True:
        print("\n=== Customer Management System ===")
        print("1. Add Customer")
        print("2. View Customer")
        print("3. View All Customers")
        print("4. Delete Customer")
        print("5. Exit")

        choice = input("Enter your choice: ")
        clear_console()

        if choice == "1":
            print("--- Add Customer ---")
            customer_id = input("Enter Customer ID: ")
            name = input("Enter Name: ")
            email = input("Enter Email: ")
            manager.add_customer(customer_id, name, email)
        elif choice == "2":
            print("--- View Customer ---")
            customer_id = input("Enter Customer ID: ")
            manager.view_customer(customer_id)
        elif choice == "3":
            print("--- View All Customers ---")
            manager.view_all_customers()
        elif choice == "4":
            print("--- Delete Customer ---")
            customer_id = input("Enter Customer ID: ")
            manager.delete_customer(customer_id)
        elif choice == "5":
            print("Exiting the application. Goodbye!")
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()
