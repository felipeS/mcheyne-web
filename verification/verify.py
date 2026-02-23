from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            # Wait for server to be ready
            for i in range(10):
                try:
                    page.goto("http://localhost:3000")
                    break
                except:
                    time.sleep(2)

            # Check for main landmark
            main = page.get_by_role("main")
            if main.count() > 0:
                print("Main landmark found!")
                print(f"Main content: {main.inner_text()[:50]}...")
            else:
                print("Main landmark NOT found!")

            page.screenshot(path="verification/screenshot.png")
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
