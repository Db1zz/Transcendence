package com.anteiku.backend.util;

public class QueryUtils {
    public static String getQueryParameter(String query, String name) {
        String result = null;

        String[] parameters = query.split("&");
        for (String parameter : parameters) {
            int i = parameter.indexOf('=');
            if (parameter.substring(0, i).equals(name)) {
                result = parameter.substring(i + 1);
                break;
            }
        }

        return result;
    }
}
