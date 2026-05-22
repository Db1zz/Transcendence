import axios from "axios";
import api from "./api";

describe("API Axios Interceptor", () => {
  let mockAdapter: jest.Mock;

  const originalWindowLocation = window.location;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAdapter = jest.fn();
    api.defaults.adapter = mockAdapter;

    jest.spyOn(Storage.prototype, "removeItem");

    delete (window as any).location;
    window.location = {
      ...originalWindowLocation,
      pathname: "/",
      href: "https://localhost/",
    } as any;

    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    window.location = originalWindowLocation;
    jest.restoreAllMocks();
  });

  const createAxiosError = (status: number, url: string = "/test") => {
    const error: any = new Error(`Request failed with status code ${status}`);
    error.config = { url };
    error.response = { status };
    return error;
  };

  it("passes successful responses through without interception", async () => {
    const mockResponse = { data: "success", status: 200 };
    mockAdapter.mockResolvedValueOnce(mockResponse);

    const response = await api.get("/test");

    expect(response.data).toBe("success");
    expect(mockAdapter).toHaveBeenCalledTimes(1);
  });

  it("rejects non-401 errors immediately without attempting refresh", async () => {
    const error500 = createAxiosError(500);
    mockAdapter.mockRejectedValueOnce(error500);

    await expect(api.get("/test")).rejects.toThrow(
      "Request failed with status code 500",
    );

    expect(mockAdapter).toHaveBeenCalledTimes(1);
  });

  it("handles 401 errors by successfully refreshing the token and retrying the request", async () => {
    const error401 = createAxiosError(401);
    const mockSuccessResponse = {
      data: "retry success",
      status: 200,
      config: error401.config,
    };

    mockAdapter
      .mockRejectedValueOnce(error401)
      .mockResolvedValueOnce({ status: 200, data: {} })
      .mockResolvedValueOnce(mockSuccessResponse);

    const response = await api.get("/test");

    expect(mockAdapter).toHaveBeenCalledTimes(3);

    const refreshRequestConfig = mockAdapter.mock.calls[1][0];
    expect(refreshRequestConfig.url).toBe("/auth/refresh");
    expect(refreshRequestConfig.method).toBe("post");

    expect(response.data).toBe("retry success");
  });

  it("clears localStorage and redirects to /login if the token refresh fails", async () => {
    const error401 = createAxiosError(401);
    
    const refreshError: any = new Error("Refresh token expired");
    refreshError.config = { url: "/auth/refresh" };

    mockAdapter
      .mockRejectedValueOnce(error401)
      .mockRejectedValueOnce(refreshError);

    await expect(api.get("/test")).rejects.toThrow("Refresh token expired");

    expect(localStorage.removeItem).toHaveBeenCalledWith("user");
    expect(window.location.href).toBe("/login");
  });

  it("does not redirect to /login if the user is already on the /login page", async () => {
    window.location.pathname = "/login";
    window.location.href = "https://localhost/login";

    const error401 = createAxiosError(401);
    
    const refreshError: any = new Error("Refresh token expired");
    refreshError.config = { url: "/auth/refresh" };

    mockAdapter
      .mockRejectedValueOnce(error401)
      .mockRejectedValueOnce(refreshError);

    await expect(api.get("/test")).rejects.toThrow("Refresh token expired");

    expect(window.location.href).toBe("https://localhost/login");
  });

  it("aborts the retry loop if the request URL was the refresh endpoint itself", async () => {
    const error401 = createAxiosError(401, "/auth/refresh");
    mockAdapter.mockRejectedValueOnce(error401);

    await expect(api.get("/auth/refresh")).rejects.toThrow(
      "Request failed with status code 401",
    );

    expect(mockAdapter).toHaveBeenCalledTimes(1);
  });
});